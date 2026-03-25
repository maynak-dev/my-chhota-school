import { useState, useEffect } from 'react';
import api from '../../services/api';

const FeeDetails = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const parentRes = await api.get('/parents/me');
        setChildren(parentRes.data.children);
        if (parentRes.data.children.length > 0) {
          setSelectedChild(parentRes.data.children[0]);
        }
      } catch (err) {
        console.error('Failed to load children', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      const fetchFees = async () => {
        try {
          const res = await api.get(`/fees/student/${selectedChild.id}`);
          setFees(res.data);
        } catch (err) {
          console.error('Failed to load fees', err);
        }
      };
      fetchFees();
    }
  }, [selectedChild]);

  if (loading) return <div>Loading...</div>;

  if (!children.length) return <div>No children linked to your account.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Fee Details</h1>
      <div className="bg-white p-6 rounded shadow mb-6">
        <label className="block text-gray-700 mb-2">Select Child</label>
        <select
          value={selectedChild?.id || ''}
          onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value))}
          className="border p-2 rounded w-full md:w-1/2"
        >
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.user.name} (Roll: {child.rollNumber})</option>
          ))}
        </select>
      </div>

      {selectedChild && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(fee => (
                <tr key={fee.id}>
                  <td className="px-6 py-4">₹{fee.totalFees}</td>
                  <td className="px-6 py-4">₹{fee.paidAmount}</td>
                  <td className="px-6 py-4">₹{fee.totalFees - fee.paidAmount}</td>
                  <td className="px-6 py-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${fee.status === 'PAID' ? 'bg-green-100 text-green-800' : fee.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {fee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeDetails;