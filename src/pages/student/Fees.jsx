import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, StatusBadge, PrimaryButton, LoadingSpinner } from '../../components/UI';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [modalFee, setModalFee] = useState(null);

  const fetchFees = async () => {
    try {
      const sRes = await api.get('/students/me');
      const res = await api.get(`/fees/student/${sRes.data.id}`);
      setFees(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchFees(); }, []);

  const handlePayClick = (fee) => {
    setModalFee(fee);
    setPayAmount((fee.totalFees - fee.paidAmount).toString());
  };

  const handlePay = async () => {
    const due = modalFee.totalFees - modalFee.paidAmount;
    if (!payAmount || Number(payAmount) <= 0 || Number(payAmount) > due) return;
    setPayingId(modalFee.id);
    try {
      await api.post('/payments', { feeId: modalFee.id, amount: Number(payAmount), method: 'ONLINE' });
      setModalFee(null);
      fetchFees();
    } catch {} finally { setPayingId(null); }
  };

  const totalDue = fees.reduce((s, f) => s + Math.max(0, (f.totalFees || 0) - (f.paidAmount || 0)), 0);
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="My Fees" subtitle="Track your fee payments and dues" />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
          <div className="text-2xl mb-1">✅</div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#2d9e6b' }}>₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-semibold">Total Paid</p>
        </div>
        <div className="bg-white rounded-2xl p-5 text-center" style={{ boxShadow: '0 2px 12px rgba(27,63,122,0.07)' }}>
          <div className="text-2xl mb-1">⏳</div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#e63946' }}>₹{totalDue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 font-semibold">Total Due</p>
        </div>
      </div>

      {loading ? (
        <Card><LoadingSpinner /></Card>
      ) : fees.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-gray-400 text-sm">No fee records found.</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {fees.map((fee) => {
            const due = fee.totalFees - fee.paidAmount;
            const pct = fee.totalFees ? ((fee.paidAmount / fee.totalFees) * 100) : 0;
            return (
              <Card key={fee.id}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#0f2447' }}>
                        Fee Record
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={fee.status} />
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 rounded-xl" style={{ background: '#f8faff' }}>
                      <p className="text-xs text-gray-500 font-semibold">Total</p>
                      <p className="font-bold text-sm mt-0.5">₹{fee.totalFees?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: '#e6f6ef' }}>
                      <p className="text-xs font-semibold" style={{ color: '#2d9e6b' }}>Paid</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color: '#2d9e6b' }}>₹{fee.paidAmount?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl" style={{ background: due > 0 ? '#fff0f1' : '#e6f6ef' }}>
                      <p className="text-xs font-semibold" style={{ color: due > 0 ? '#e63946' : '#2d9e6b' }}>Balance</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color: due > 0 ? '#e63946' : '#2d9e6b' }}>₹{due.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Payment Progress</span>
                      <span>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0f4fc' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #2d9e6b, #22c55e)',
                      }} />
                    </div>
                  </div>

                  {due > 0 && (
                    <button
                      onClick={() => handlePayClick(fee)}
                      className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #1b3f7a, #2a5bae)', boxShadow: '0 4px 12px rgba(27,63,122,0.3)' }}
                    >
                      💳 Pay Now
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Modal */}
      {modalFee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(15,36,71,0.55)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>Make Payment</h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Balance Due</span>
                <span className="font-bold text-red-500">₹{(modalFee.totalFees - modalFee.paidAmount).toLocaleString()}</span>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Amount to Pay (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={modalFee.totalFees - modalFee.paidAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm"
                  style={{ borderColor: '#d1d5db' }}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModalFee(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: '#d1d5db', color: '#6b7280' }}
              >
                Cancel
              </button>
              <PrimaryButton onClick={handlePay} loading={payingId === modalFee.id} className="flex-1">
                Confirm Pay
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
