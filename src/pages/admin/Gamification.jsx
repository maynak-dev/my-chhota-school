import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormGrid, Table, Td, LoadingSpinner } from '../../components/UI';

const Gamification = () => {
  const [badges, setBadges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '🏆', criteria: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gamification/badges').then(res => { setBadges(res.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/gamification/badges', form);
      setBadges([res.data, ...badges]);
      setShowForm(false);
      setForm({ name: '', description: '', icon: '🏆', criteria: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Gamification" subtitle="Badges, leaderboards & streaks" />
        <PrimaryButton onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Create Badge'}</PrimaryButton>
      </div>

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Badge Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <FormInput label="Icon (Emoji)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
              <FormInput label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              <FormInput label="Criteria" value={form.criteria} onChange={e => setForm({ ...form, criteria: e.target.value })} placeholder="e.g., complete_5_courses" />
            </FormGrid>
            <div className="mt-4"><PrimaryButton type="submit">Create Badge</PrimaryButton></div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader title="All Badges" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {badges.map(b => (
            <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md"
              style={{ background: '#f8faff', border: '1px solid #eaf0fb' }}>
              <span className="text-3xl">{b.icon || '🏆'}</span>
              <div>
                <h4 className="font-bold text-sm" style={{ color: '#0f2447' }}>{b.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded-full"
                  style={{ background: '#e0e7ff', color: '#1b3f7a' }}>{b.criteria}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Gamification;