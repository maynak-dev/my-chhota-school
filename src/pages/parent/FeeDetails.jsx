import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, StatusBadge, LoadingSpinner } from '../../components/UI';

const PAYMENT_METHODS = ['CASH', 'ONLINE', 'CARD'];

const FeeDetails = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment modal state
  const [payModal, setPayModal] = useState(null); // { fee }
  const [payForm, setPayForm] = useState({ amount: '', method: 'ONLINE', transactionId: '' });
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [payError, setPayError] = useState(false);

  useEffect(() => {
    api.get('/parents/me')
      .then(res => {
        const kids = res.data.children || [];
        setChildren(kids);
        if (kids.length > 0) setSelectedChild(kids[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchFees = (childId) => {
    api.get(`/fees/student/${childId}`).then(res => setFees(res.data)).catch(() => {});
  };

  useEffect(() => {
    if (selectedChild) fetchFees(selectedChild.id);
  }, [selectedChild]);

  const openPayModal = (fee) => {
    const balance = fee.totalFees - fee.paidAmount;
    setPayForm({ amount: balance > 0 ? String(balance) : '', method: 'ONLINE', transactionId: '' });
    setPayMsg(''); setPayError(false);
    setPayModal({ fee });
  };

  const handlePay = async () => {
    if (!payForm.amount || isNaN(payForm.amount) || Number(payForm.amount) <= 0) {
      setPayMsg('Please enter a valid amount.'); setPayError(true); return;
    }
    setPaying(true); setPayMsg(''); setPayError(false);
    try {
      await api.post('/payments', {
        feeId: payModal.fee.id,
        amount: Number(payForm.amount),
        method: payForm.method,
        transactionId: payForm.transactionId || undefined,
      });
      setPayMsg('Payment submitted! Admin has been notified to verify and update fee status.');
      setPayError(false);
      fetchFees(selectedChild.id);
      setTimeout(() => { setPayModal(null); setPayMsg(''); }, 3500);
    } catch (err) {
      setPayMsg(err.response?.data?.error || 'Payment failed. Please try again.');
      setPayError(true);
    } finally { setPaying(false); }
  };

  if (loading) return <Card><LoadingSpinner /></Card>;

  if (!children.length) return (
    <div className="space-y-5">
      <PageHeader title="Fee Details" />
      <Card><div className="py-12 text-center text-gray-400 text-sm">No children linked to your account.</div></Card>
    </div>
  );

  const totalDue = fees.reduce((s, f) => s + Math.max(0, (f.totalFees || 0) - (f.paidAmount || 0)), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Fee Details" subtitle="View and pay your child's fees" />

      <Card>
        <CardHeader title="Select Child" />
        <div className="p-5 max-w-sm">
          <FormSelect
            value={selectedChild?.id || ''}
            onChange={(e) => {
              const child = children.find(c => c.id === e.target.value);
              setSelectedChild(child); setFees([]);
            }}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>{c.user?.name} (Roll: {c.rollNumber})</option>
            ))}
          </FormSelect>
        </div>
      </Card>

      {selectedChild && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#2d9e6b' }}>₹{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Total Paid</p>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#e63946' }}>₹{totalDue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Total Due</p>
            </div>
          </div>

          <Card>
            <CardHeader title="Fee Records" />

            {/* Desktop */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ background: '#f8faff' }}>
                    {['Total Fees', 'Paid', 'Balance', 'Due Date', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                        style={{ borderBottom: '2px solid #eaf0fb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f0f4fc' }}>
                  {fees.map(fee => {
                    const due = fee.totalFees - fee.paidAmount;
                    return (
                      <tr key={fee.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold">₹{fee.totalFees?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-green-600">₹{fee.paidAmount?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-red-500">₹{due.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(fee.dueDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={fee.status} /></td>
                        <td className="px-5 py-3.5">
                          {due > 0 ? (
                            <button
                              onClick={() => openPayModal(fee)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
                              style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
                            >
                              💳 Pay Now
                            </button>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold">✓ Fully Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {fees.map(fee => {
                const due = fee.totalFees - fee.paidAmount;
                const pctPaid = fee.totalFees ? ((fee.paidAmount / fee.totalFees) * 100) : 0;
                return (
                  <div key={fee.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm">₹{fee.totalFees?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <StatusBadge status={fee.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2 rounded-lg text-center" style={{ background: '#e6f6ef' }}>
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-bold text-sm text-green-600">₹{fee.paidAmount?.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg text-center" style={{ background: due > 0 ? '#fff0f1' : '#e6f6ef' }}>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className={`font-bold text-sm ${due > 0 ? 'text-red-500' : 'text-green-600'}`}>₹{due.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: '#f0f4fc' }}>
                      <div className="h-full rounded-full" style={{ width: `${pctPaid}%`, background: 'linear-gradient(90deg, #2d9e6b, #22c55e)' }} />
                    </div>
                    {due > 0 && (
                      <button
                        onClick={() => openPayModal(fee)}
                        className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
                      >
                        💳 Pay Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {fees.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No fee records found.</div>}
          </Card>
        </>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" style={{ border: '1.5px solid #e8f0fe' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#1b3f7a', fontFamily: 'Baloo 2, cursive' }}>Pay Fees</h3>
                <p className="text-xs text-gray-400 mt-0.5">Balance: ₹{(payModal.fee.totalFees - payModal.fee.paidAmount).toLocaleString()}</p>
              </div>
              <button onClick={() => setPayModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={payModal.fee.totalFees - payModal.fee.paidAmount}
                  value={payForm.amount}
                  onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none"
                  style={{ border: '1.5px solid #e8f0fe', background: '#f8faff' }}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayForm({ ...payForm, method: m })}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: payForm.method === m ? '#1b3f7a' : '#f0f4fc',
                        color: payForm.method === m ? '#fff' : '#1b3f7a',
                        border: `1.5px solid ${payForm.method === m ? '#1b3f7a' : '#e8f0fe'}`,
                      }}
                    >
                      {m === 'ONLINE' ? '🌐' : m === 'CASH' ? '💵' : '💳'} {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID for ONLINE */}
              {payForm.method !== 'CASH' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Transaction ID <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={payForm.transactionId}
                    onChange={e => setPayForm({ ...payForm, transactionId: e.target.value })}
                    placeholder="E.g. UPI reference number"
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ border: '1.5px solid #e8f0fe', background: '#f8faff' }}
                  />
                </div>
              )}

              {/* Info note */}
              <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: '#fffbea', border: '1px solid #fde68a', color: '#92400e' }}>
                ℹ️ After payment, the admin will receive a notification and verify your payment before updating the fee status.
              </div>

              {payMsg && (
                <div className="px-3 py-2.5 rounded-xl text-xs font-medium"
                  style={{ background: payError ? '#fff0f1' : '#e6f6ef', color: payError ? '#e63946' : '#2d9e6b', border: `1px solid ${payError ? '#fbc8cb' : '#b7e9d0'}` }}>
                  {payMsg}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
              >
                {paying ? 'Processing...' : `💳 Submit Payment of ₹${payForm.amount || '0'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeDetails;
