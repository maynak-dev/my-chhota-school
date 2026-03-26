import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, StatusBadge, LoadingSpinner } from '../../components/UI';

const FeeDetails = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/parents/me');
        setChildren(res.data.children || []);
        if (res.data.children?.length > 0) setSelectedChild(res.data.children[0]);
      } catch {} finally { setLoading(false); }
    };
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      api.get(`/fees/student/${selectedChild.id}`).then((res) => setFees(res.data)).catch(() => {});
    }
  }, [selectedChild]);

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
      <PageHeader title="Fee Details" subtitle="Monitor your child's fee status" />

      <Card>
        <CardHeader title="Select Child" />
        <div className="p-5 max-w-sm">
          <FormSelect
            value={selectedChild?.id || ''}
            onChange={(e) => setSelectedChild(children.find((c) => c.id === e.target.value))}
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
                    {['Total Fees', 'Paid', 'Balance', 'Due Date', 'Status'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                        style={{ borderBottom: '2px solid #eaf0fb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f0f4fc' }}>
                  {fees.map((fee) => {
                    const due = fee.totalFees - fee.paidAmount;
                    return (
                      <tr key={fee.id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-semibold">₹{fee.totalFees?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-green-600">₹{fee.paidAmount?.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-red-500">₹{due.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{new Date(fee.dueDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={fee.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {fees.map((fee) => {
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
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f4fc' }}>
                      <div className="h-full rounded-full" style={{ width: `${pctPaid}%`, background: 'linear-gradient(90deg, #2d9e6b, #22c55e)' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {fees.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No fee records found.</div>}
          </Card>
        </>
      )}
    </div>
  );
};

export default FeeDetails;
