import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, LoadingSpinner } from '../../components/UI';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_COLORS = ['#e8f0fe', '#e6f6ef', '#fff0f1', '#fef3c7', '#f0ebff', '#fce7f3'];
const DAY_TEXT = ['#1b3f7a', '#2d9e6b', '#e63946', '#d97706', '#8b5cf6', '#db2777'];

const Timetable = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [timetable, setTimetable] = useState([]);
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
      api.get(`/timetable/batch/${selectedChild.batchId}`)
        .then((res) => setTimetable(res.data)).catch(() => {});
    }
  }, [selectedChild]);

  if (loading) return <Card><LoadingSpinner /></Card>;

  if (!children.length) return (
    <div className="space-y-5">
      <PageHeader title="Class Timetable" />
      <Card><div className="py-12 text-center text-gray-400 text-sm">No children linked to your account.</div></Card>
    </div>
  );

  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = timetable.filter((e) => e.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const totalPeriods = timetable.length;

  return (
    <div className="space-y-5">
      <PageHeader title="Class Timetable" subtitle="See your child's weekly schedule" />

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
          {/* Child banner */}
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #0f2447, #1b3f7a)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: '#2d9e6b' }}>
              {selectedChild.user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{selectedChild.user?.name}</p>
              <p className="text-blue-200 text-xs">{selectedChild.batch?.name || 'No batch'} · {totalPeriods} periods/week</p>
            </div>
          </div>

          {/* Weekly grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day, idx) => (
              <Card key={day}>
                <div className="px-4 py-3 flex items-center gap-2 rounded-t-2xl"
                  style={{ background: DAY_COLORS[idx] }}>
                  <span className="font-bold text-sm" style={{ color: DAY_TEXT[idx] }}>{day}</span>
                  <span className="ml-auto text-xs font-bold rounded-full px-2 py-0.5 text-white"
                    style={{ background: DAY_TEXT[idx] }}>
                    {grouped[day].length} classes
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  {grouped[day].length > 0 ? grouped[day].map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{ background: '#f8faff' }}>
                      <div className="flex-shrink-0 text-xs font-semibold text-gray-500 text-center w-14">
                        <div>{entry.startTime}</div>
                        <div className="text-gray-300">—</div>
                        <div>{entry.endTime}</div>
                      </div>
                      <div className="w-px h-8 rounded bg-gray-200 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: '#0f2447' }}>{entry.subject}</p>
                        {entry.teacher?.user?.name && (
                          <p className="text-xs text-gray-400 truncate">{entry.teacher.user.name}</p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-xs text-gray-400 py-4">No classes</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Timetable;
