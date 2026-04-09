import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, GreenButton, FormInput, FormSelect, FormGrid, FormTextarea, Table, Td, LoadingSpinner } from '../../components/UI';

const NotificationRules = () => {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [form, setForm] = useState({ name: '', trigger: 'LOW_ATTENDANCE', condition: { threshold: 75 }, template: '', targetRole: '' });

  useEffect(() => {
    api.get('/notification-rules').then(res => { setRules(res.data); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/notification-rules', { ...form, targetRole: form.targetRole || null });
    setRules([res.data, ...rules]);
    setShowForm(false);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await api.post('/notification-rules/evaluate');
      alert(`Triggered ${res.data.triggered} notifications!`);
    } catch (err) {
      alert('Failed to evaluate rules');
    }
    setEvaluating(false);
  };

  const triggerColors = {
    LOW_ATTENDANCE: { bg: '#fff0f1', color: '#e63946' },
    FEE_DUE: { bg: '#fef3c7', color: '#d97706' },
    MISSED_CLASS: { bg: '#e0e7ff', color: '#1b3f7a' },
    LOW_PERFORMANCE: { bg: '#fff0f1', color: '#e63946' },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Notification Rules" subtitle="Automate alerts based on conditions" />
        <div className="flex gap-2">
          <GreenButton onClick={handleEvaluate} loading={evaluating}>⚡ Run Now</GreenButton>
          <PrimaryButton onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ New Rule'}</PrimaryButton>
        </div>
      </div>

      {showForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Rule Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <FormSelect label="Trigger" value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })}>
                <option value="LOW_ATTENDANCE">Low Attendance</option>
                <option value="FEE_DUE">Fee Due</option>
                <option value="MISSED_CLASS">Missed Class</option>
                <option value="LOW_PERFORMANCE">Low Performance</option>
              </FormSelect>
              <FormSelect label="Target Role" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                <option value="">All</option>
                <option value="PARENT">Parent</option>
                <option value="STUDENT">Student</option>
              </FormSelect>
              {form.trigger === 'LOW_ATTENDANCE' && (
                <FormInput label="Threshold (%)" type="number" value={form.condition.threshold}
                  onChange={e => setForm({ ...form, condition: { threshold: parseInt(e.target.value) } })} />
              )}
              {form.trigger === 'FEE_DUE' && (
                <FormInput label="Days Before Due" type="number" value={form.condition.daysBefore || 3}
                  onChange={e => setForm({ ...form, condition: { daysBefore: parseInt(e.target.value) } })} />
              )}
            </FormGrid>
            <div className="mt-3">
              <FormTextarea label="Message Template (use {{name}}, {{rate}}, {{amount}}, {{date}})"
                value={form.template} onChange={e => setForm({ ...form, template: e.target.value })} required rows={3}
                placeholder="Dear Parent, {{name}}'s attendance is {{rate}}%. Please ensure regular attendance." />
            </div>
            <div className="mt-4"><PrimaryButton type="submit">Create Rule</PrimaryButton></div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader title="Active Rules" />
        <Table headers={['Name', 'Trigger', 'Condition', 'Target', 'Status']}>
          {rules.map(r => (
            <tr key={r.id}>
              <Td className="font-semibold">{r.name}</Td>
              <Td>
                <span className="badge" style={triggerColors[r.trigger]}>{r.trigger.replace('_', ' ')}</span>
              </Td>
              <Td className="text-xs">{JSON.stringify(r.condition)}</Td>
              <Td>{r.targetRole || 'All'}</Td>
              <Td>
                <span className="badge" style={{ background: r.isActive ? '#e6f6ef' : '#f1f5f9', color: r.isActive ? '#2d9e6b' : '#64748b' }}>
                  {r.isActive ? 'Active' : 'Inactive'}
                </span>
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

export default NotificationRules;