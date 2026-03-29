import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, StatusBadge, LoadingSpinner } from '../../components/UI';

const PAYMENT_METHODS = ['CASH', 'ONLINE', 'CARD'];

const FeeDetails = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [fees, setFees] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment modal state
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', method: 'ONLINE', transactionId: '' });
  const [paying, setPaying] = useState(false);
  const [payMsg, setPayMsg] = useState('');
  const [payError, setPayError] = useState(false);

  // Fetch parent's children
  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Adjust endpoint to match your backend – typically '/parents/me' or '/auth/me' with role
        const res = await api.get('/parents/me');
        const kids = res.data.children || [];
        setChildren(kids);
        if (kids.length > 0) {
          setSelectedChild(kids[0]);
          await Promise.all([
            fetchFees(kids[0].id),
            fetchPendingPayments(kids[0].id)
          ]);
        }
      } catch (err) {
        console.error('Failed to load children:', err);
        setError('Unable to load your children. Please refresh or contact support.');
      } finally {
        setLoading(false);
      }
    };
    fetchParentData();
  }, []);

  const fetchFees = async (childId) => {
    try {
      // Use query parameter instead of path param (more RESTful)
      const res = await api.get(`/fees?studentId=${childId}`);
      setFees(res.data);
    } catch (err) {
      console.error('Failed to fetch fees:', err);
      setFees([]);
    }
  };

  const fetchPendingPayments = async (childId) => {
    try {
      const res = await api.get(`/payments?studentId=${childId}&status=PENDING`);
      setPendingPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch pending payments:', err);
      setPendingPayments([]);
    }
  };

  const handleChildChange = async (childId) => {
    const child = children.find(c => c.id === childId);
    setSelectedChild(child);
    setFees([]);
    setPendingPayments([]);
    await Promise.all([
      fetchFees(childId),
      fetchPendingPayments(childId)
    ]);
  };

  const openPayModal = (fee) => {
    const balance = fee.totalFees - fee.paidAmount;
    setPayForm({
      amount: balance > 0 ? String(balance) : '',
      method: 'ONLINE',
      transactionId: ''
    });
    setPayMsg('');
    setPayError(false);
    setPayModal({ fee });
  };

  const handlePay = async () => {
    if (!payForm.amount || isNaN(payForm.amount) || Number(payForm.amount) <= 0) {
      setPayMsg('Please enter a valid amount.');
      setPayError(true);
      return;
    }
    const balance = payModal.fee.totalFees - payModal.fee.paidAmount;
    if (Number(payForm.amount) > balance) {
      setPayMsg(`Amount cannot exceed due balance of ₹${balance.toLocaleString()}.`);
      setPayError(true);
      return;
    }

    setPaying(true);
    setPayMsg('');
    setPayError(false);

    try {
      await api.post('/payments', {
        feeId: payModal.fee.id,
        amount: Number(payForm.amount),
        method: payForm.method,
        transactionId: payForm.transactionId || undefined,
      });
      setPayMsg('✅ Payment submitted! Admin will verify it shortly.');
      setPayError(false);
      // Refresh data
      await Promise.all([
        fetchFees(selectedChild.id),
        fetchPendingPayments(selectedChild.id)
      ]);
      setTimeout(() => {
        setPayModal(null);
        setPayMsg('');
      }, 3500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Payment failed. Please try again.';
      setPayMsg(errorMsg);
      setPayError(true);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Card><LoadingSpinner /></Card>;

  if (error) {
    return (
      <div className="space-y-5">
        <PageHeader title="Fee Details" />
        <Card>
          <div className="py-12 text-center text-red-500 text-sm">{error}</div>
        </Card>
      </div>
    );
  }

  if (!children.length) {
    return (
      <div className="space-y-5">
        <PageHeader title="Fee Details" />
        <Card>
          <div className="py-12 text-center text-gray-400 text-sm">
            No children linked to your account. Please contact the school.
          </div>
        </Card>
      </div>
    );
  }

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
            onChange={(e) => handleChildChange(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.user?.name} (Roll: {c.rollNumber})
              </option>
            ))}
          </FormSelect>
        </div>
      </Card>

      {selectedChild && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-5 text-center shadow-md">
              <p className="text-2xl font-bold font-baloo text-green-600">₹{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Total Paid</p>
            </div>
            <div className="bg-white rounded-2xl p-5 text-center shadow-md">
              <p className="text-2xl font-bold font-baloo text-red-500">₹{totalDue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">Total Due</p>
            </div>
          </div>

          {/* Pending Payments Section */}
          {pendingPayments.length > 0 && (
            <Card>
              <CardHeader title="⏳ Pending Approval" />
              <div className="divide-y border-t border-gray-100">
                {pendingPayments.map(p => (
                  <div key={p.id} className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-amber-700">
                        {p.fee?.feeType?.name || 'Fee Payment'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Amount: ₹{p.amount.toLocaleString()} • Method: {p.method} • {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <StatusBadge status="PENDING" />
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-center text-amber-600 bg-amber-50 p-2 rounded-lg">
                ℹ️ Your payment request is pending admin approval. Once approved, the fee status will be updated.
              </div>
            </Card>
          )}

          {/* Fee Records Table */}
          <Card>
            <CardHeader title="Fee Records" />

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    {['Total Fees', 'Paid', 'Balance', 'Due Date', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fees.map(fee => {
                    const due = fee.totalFees - fee.paidAmount;
                    const hasPending = pendingPayments.some(p => p.feeId === fee.id);
                    return (
                      <tr key={fee.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold">₹{fee.totalFees?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-green-600">₹{fee.paidAmount?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-red-500">₹{due.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'No due date'}
                        </td>
                        <td className="px-5 py-3.5"><StatusBadge status={fee.status} /></td>
                        <td className="px-5 py-3.5">
                          {hasPending ? (
                            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-full">
                              ⏳ Pending Approval
                            </span>
                          ) : due > 0 ? (
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

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {fees.map(fee => {
                const due = fee.totalFees - fee.paidAmount;
                const pctPaid = fee.totalFees ? ((fee.paidAmount / fee.totalFees) * 100) : 0;
                const hasPending = pendingPayments.some(p => p.feeId === fee.id);
                return (
                  <div key={fee.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm">₹{fee.totalFees?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          Due: {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                      <StatusBadge status={fee.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2 rounded-lg text-center bg-green-50">
                        <p className="text-xs text-gray-500">Paid</p>
                        <p className="font-bold text-sm text-green-600">₹{fee.paidAmount?.toLocaleString()}</p>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${due > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className={`font-bold text-sm ${due > 0 ? 'text-red-500' : 'text-green-600'}`}>
                          ₹{due.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden mb-3 bg-gray-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400" style={{ width: `${pctPaid}%` }} />
                    </div>
                    {hasPending ? (
                      <div className="text-center text-xs text-amber-600 bg-amber-50 p-2 rounded-xl font-semibold">
                        ⏳ Payment pending approval
                      </div>
                    ) : due > 0 ? (
                      <button
                        onClick={() => openPayModal(fee)}
                        className="w-full py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
                      >
                        💳 Pay Now
                      </button>
                    ) : (
                      <div className="text-center text-xs text-green-600 font-semibold">✓ Fully Paid</div>
                    )}
                  </div>
                );
              })}
            </div>

            {fees.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No fee records found.</div>
            )}
          </Card>
        </>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-blue-50">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold font-baloo text-blue-900">Pay Fees</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Balance: ₹{(payModal.fee.totalFees - payModal.fee.paidAmount).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setPayModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-all text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={payModal.fee.totalFees - payModal.fee.paidAmount}
                  value={payForm.amount}
                  onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold outline-none border border-gray-200 bg-gray-50 focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayForm({ ...payForm, method: m })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        payForm.method === m
                          ? 'bg-blue-900 text-white border-transparent'
                          : 'bg-gray-100 text-blue-900 border border-gray-200'
                      }`}
                    >
                      {m === 'ONLINE' ? '🌐' : m === 'CASH' ? '💵' : '💳'} {m}
                    </button>
                  ))}
                </div>
              </div>

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
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-gray-200 bg-gray-50"
                  />
                </div>
              )}

              <div className="px-3 py-2.5 rounded-xl text-xs bg-amber-50 border border-amber-200 text-amber-800">
                ℹ️ After payment, the admin will receive a notification and verify your payment before updating the fee status.
              </div>

              {payMsg && (
                <div className={`px-3 py-2.5 rounded-xl text-xs font-medium ${
                  payError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'
                }`}>
                  {payMsg}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-60 bg-gradient-to-r from-blue-900 to-green-600"
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