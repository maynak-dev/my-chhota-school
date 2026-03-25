import { useState, useEffect } from 'react';
import api from '../../services/api';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const studentRes = await api.get('/students/me');
        const studentId = studentRes.data.id;
        const res = await api.get(`/fees/student/${studentId}`);
        setFees(res.data);
      } catch (err) {
        console.error('Failed to load fees', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  const handlePay = async (feeId, dueAmount) => {
    const amount = prompt(`Enter amount to pay (Max: ₹${dueAmount}):`, dueAmount);
    if (!amount) return;
    if (amount > dueAmount) {
      alert('Amount cannot exceed due amount');
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await api.post('/payments', { feeId, amount, method: 'ONLINE' });
      alert(`Payment successful! Receipt No: ${res.data.receiptNo}`);
      // Refresh fees
      const studentRes = await api.get('/students/me');
      const studentId = studentRes.data.id;
      const refreshed = await api.get(`/fees/student/${studentId}`);
      setFees(refreshed.data);
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div>Loading fee details...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fee Details</h1>
      <div className="grid gap-6">
        {fees.map(fee => {
          const dueAmount = fee.totalFees - fee.paidAmount;
          return (
            <div key={fee.id} className="bg-white rounded shadow p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Fees</p>
                  <p className="text-xl font-bold">₹{fee.totalFees}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Paid Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{fee.paidAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Due Amount</p>
                  <p className="text-xl font-bold text-red-600">₹{dueAmount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Due Date</p>
                  <p className="text-xl font-bold">{new Date(fee.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded text-sm ${fee.status === 'PAID' ? 'bg-green-100 text-green-800' : fee.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {fee.status}
                </span>
                {dueAmount > 0 && (
                  <button
                    onClick={() => handlePay(fee.id, dueAmount)}
                    disabled={paymentLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Fees;