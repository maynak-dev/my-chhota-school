import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormSelect, Table, Td } from '../../components/UI';

const StudentList = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/teachers/me/batches').then((res) => setBatches(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      api.get(`/batches/${selectedBatch}/students`).then((res) => setStudents(res.data)).catch(() => {});
    } else { setStudents([]); }
  }, [selectedBatch]);

  const batchName = batches.find((b) => b.id === selectedBatch)?.name;

  const filtered = students.filter(
    (s) =>
      s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = ['#1b3f7a', '#2d9e6b', '#e63946', '#f59e0b', '#8b5cf6', '#db2777'];

  return (
    <div className="space-y-5">
      <PageHeader title="Student List" subtitle="View students in your assigned batches" />

      <Card>
        <CardHeader title="Select Batch" />
        <div className="p-5 max-w-sm">
          <FormSelect value={selectedBatch} onChange={(e) => { setSelectedBatch(e.target.value); setSearch(''); }}>
            <option value="">— Choose a batch —</option>
            {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </FormSelect>
        </div>
      </Card>

      {selectedBatch && (
        <Card>
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: '#eaf0fb' }}>
            <h2 className="font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
              {batchName}
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} students)</span>
            </h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-xl text-sm w-full sm:w-52"
                style={{ borderColor: '#d1d5db', background: '#fafafa' }}
              />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden sm:block">
            <Table headers={['Roll No', 'Name', 'Email', 'Phone']}>
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                  <Td>
                    <span className="font-mono font-semibold text-xs bg-gray-100 px-2 py-1 rounded">{s.rollNumber}</span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: avatarColors[idx % avatarColors.length] }}>
                        {s.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium">{s.user?.name}</span>
                    </div>
                  </Td>
                  <Td>{s.user?.email}</Td>
                  <Td>{s.user?.phone || <span className="text-gray-400">—</span>}</Td>
                </tr>
              ))}
            </Table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
            {filtered.map((s, idx) => (
              <div key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: avatarColors[idx % avatarColors.length] }}>
                  {s.user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{s.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{s.user?.email}</p>
                </div>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded flex-shrink-0">{s.rollNumber}</span>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">No students found.</div>
          )}
        </Card>
      )}
    </div>
  );
};

export default StudentList;
