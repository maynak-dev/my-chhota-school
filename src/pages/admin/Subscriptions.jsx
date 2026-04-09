import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormSelect, FormGrid, Table, Td, LoadingSpinner } from '../../components/UI';

const Subscriptions = () => {
  const [tab, setTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [planForm, setPlanForm] = useState({ name: '', amount: '', duration: '', description: '' });
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: 0, validFrom: '', validTo: '' });

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/plans'),
      api.get('/subscriptions/coupons'),
    ]).then(([p, c]) => {
      setPlans(p.data);
      setCoupons(c.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handlePlan = async (e) => {
    e.preventDefault();
    const res = await api.post('/subscriptions/plans', { ...planForm, amount: parseFloat(planForm.amount), duration: parseInt(planForm.duration) });
    setPlans([res.data, ...plans]);
    setShowForm(false);
    setPlanForm({ name: '', amount: '', duration: '', description: '' });
  };

  const handleCoupon = async (e) => {
    e.preventDefault();
    const res = await api.post('/subscriptions/coupons', { ...couponForm, discountValue: parseFloat(couponForm.discountValue), maxUses: parseInt(couponForm.maxUses) });
    setCoupons([res.data, ...coupons]);
    setShowForm(false);
    setCouponForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', maxUses: 0, validFrom: '', validTo: '' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Subscriptions & Coupons" subtitle="Manage plans, discount codes & EMI options" />
        <PrimaryButton onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : `+ Add ${tab === 'plans' ? 'Plan' : 'Coupon'}`}</PrimaryButton>
      </div>

      <div className="flex gap-2 mb-6">
        {['plans', 'coupons'].map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false); }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all capitalize"
            style={{ background: tab === t ? '#1b3f7a' : '#e0e7ff', color: tab === t ? '#fff' : '#1b3f7a' }}>
            {t}
          </button>
        ))}
      </div>

      {showForm && tab === 'plans' && (
        <Card className="p-5 mb-6">
          <form onSubmit={handlePlan}>
            <FormGrid cols={2}>
              <FormInput label="Plan Name" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} required />
              <FormInput label="Amount (₹)" type="number" value={planForm.amount} onChange={e => setPlanForm({ ...planForm, amount: e.target.value })} required />
              <FormInput label="Duration (months)" type="number" value={planForm.duration} onChange={e => setPlanForm({ ...planForm, duration: e.target.value })} required />
              <FormInput label="Description" value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} />
            </FormGrid>
            <div className="mt-4"><PrimaryButton type="submit">Create Plan</PrimaryButton></div>
          </form>
        </Card>
      )}

      {showForm && tab === 'coupons' && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleCoupon}>
            <FormGrid cols={2}>
              <FormInput label="Code" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required />
              <FormSelect label="Discount Type" value={couponForm.discountType} onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </FormSelect>
              <FormInput label="Discount Value" type="number" value={couponForm.discountValue} onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })} required />
              <FormInput label="Max Uses (0=unlimited)" type="number" value={couponForm.maxUses} onChange={e => setCouponForm({ ...couponForm, maxUses: e.target.value })} />
              <FormInput label="Valid From" type="date" value={couponForm.validFrom} onChange={e => setCouponForm({ ...couponForm, validFrom: e.target.value })} required />
              <FormInput label="Valid To" type="date" value={couponForm.validTo} onChange={e => setCouponForm({ ...couponForm, validTo: e.target.value })} required />
            </FormGrid>
            <div className="mt-4"><PrimaryButton type="submit">Create Coupon</PrimaryButton></div>
          </form>
        </Card>
      )}

      {tab === 'plans' && (
        <Card>
          <CardHeader title="Subscription Plans" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {plans.map(p => (
              <div key={p.id} className="p-5 rounded-xl text-center" style={{ background: '#f8faff', border: '1px solid #eaf0fb' }}>
                <h4 className="font-bold" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>{p.name}</h4>
                <div className="text-3xl font-bold my-2" style={{ color: '#1b3f7a' }}>₹{p.amount}</div>
                <p className="text-sm text-gray-500">{p.duration} months</p>
                {p.description && <p className="text-xs text-gray-400 mt-2">{p.description}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'coupons' && (
        <Card>
          <CardHeader title="Coupons" />
          <Table headers={['Code', 'Type', 'Value', 'Used', 'Valid Until', 'Status']}>
            {coupons.map(c => (
              <tr key={c.id}>
                <Td className="font-bold font-mono">{c.code}</Td>
                <Td>{c.discountType === 'PERCENTAGE' ? '%' : '₹'}</Td>
                <Td>{c.discountValue}{c.discountType === 'PERCENTAGE' ? '%' : ''}</Td>
                <Td>{c.usedCount}{c.maxUses > 0 ? `/${c.maxUses}` : ''}</Td>
                <Td>{new Date(c.validTo).toLocaleDateString()}</Td>
                <Td>
                  <span className="badge" style={{ background: c.isActive ? '#e6f6ef' : '#fff0f1', color: c.isActive ? '#2d9e6b' : '#e63946' }}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
};

export default Subscriptions;