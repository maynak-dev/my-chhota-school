import { useState } from 'react';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormTextarea,
  PrimaryButton, Table, Td,
} from '../../components/UI';

const LessonPlanner = () => {
  const [form, setForm] = useState({ date: '', topic: '', objectives: '', activities: '' });
  const [plans, setPlans] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setPlans([{ ...form, id: Date.now() }, ...plans]);
    setForm({ date: '', topic: '', objectives: '', activities: '' });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Lesson Planner" subtitle="Plan and organize your daily lessons" />

      <Card>
        <CardHeader title="Add New Lesson Plan" />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={2}>
              <FormInput label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <FormInput label="Topic" type="text" placeholder="e.g. Photosynthesis" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} required />
              <FormTextarea label="Learning Objectives" placeholder="What will students learn?" rows={3} value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
              <FormTextarea label="Activities" placeholder="Activities and teaching methods..." rows={3} value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} />
            </FormGrid>
            <div className="mt-5">
              <PrimaryButton type="submit">📖 Add Lesson Plan</PrimaryButton>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title={`Lesson Plans (${plans.length})`} />

        {plans.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-gray-400 text-sm">No lesson plans added yet. Start planning your lessons!</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Date', 'Topic', 'Objectives', 'Activities']}>
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-blue-50 transition-colors">
                    <Td>
                      <span className="font-semibold text-sm" style={{ color: '#1b3f7a' }}>
                        {new Date(plan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </Td>
                    <Td><span className="font-semibold">{plan.topic}</span></Td>
                    <Td><span className="text-gray-600 text-sm line-clamp-2">{plan.objectives || '—'}</span></Td>
                    <Td><span className="text-gray-600 text-sm line-clamp-2">{plan.activities || '—'}</span></Td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {plans.map((plan) => (
                <div key={plan.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: '#1b3f7a' }}>
                      {new Date(plan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{plan.topic}</p>
                    </div>
                  </div>
                  {plan.objectives && (
                    <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">Objectives:</span> {plan.objectives}</p>
                  )}
                  {plan.activities && (
                    <p className="text-xs text-gray-600"><span className="font-semibold">Activities:</span> {plan.activities}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default LessonPlanner;
