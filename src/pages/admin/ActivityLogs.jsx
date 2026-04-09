import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormInput, FormGrid, Table, Td, LoadingSpinner } from '../../components/UI';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', action: '' });

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 30, ...filters });
    const res = await api.get(`/activity-logs?${params}`);
    setLogs(res.data.logs);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page]);

  const actionColors = {
    CREATE: { bg: '#e6f6ef', color: '#2d9e6b' },
    UPDATE: { bg: '#e0e7ff', color: '#1b3f7a' },
    DELETE: { bg: '#fff0f1', color: '#e63946' },
    LOGIN: { bg: '#fef3c7', color: '#d97706' },
  };

  return (
    <div className="page-fade">
      <PageHeader title="Activity Logs" subtitle="Track all system activities & audit trail" />

      <Card className="p-4 mb-4">
        <FormGrid cols={3}>
          <FormInput label="From" type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} />
          <FormInput label="To" type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} />
          <div className="flex items-end">
            <button onClick={fetchLogs} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#1b3f7a' }}>Filter</button>
          </div>
        </FormGrid>
      </Card>

      <Card>
        <CardHeader title={`Logs (${total} total)`} />
        {loading ? <LoadingSpinner /> : (
          <>
            <Table headers={['Time', 'Action', 'Entity', 'User ID', 'IP']}>
              {logs.map(l => (
                <tr key={l.id}>
                  <Td className="text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</Td>
                  <Td>
                    <span className="badge" style={actionColors[l.action] || { bg: '#f1f5f9', color: '#64748b' }}>
                      {l.action}
                    </span>
                  </Td>
                  <Td>{l.entity}</Td>
                  <Td className="text-xs font-mono">{l.userId?.slice(0, 8)}...</Td>
                  <Td className="text-xs">{l.ipAddress || '-'}</Td>
                </tr>
              ))}
            </Table>
            <div className="flex justify-between items-center px-5 py-3 text-sm">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="font-bold disabled:opacity-40" style={{ color: '#1b3f7a' }}>← Previous</button>
              <span className="text-gray-400">Page {page}</span>
              <button disabled={logs.length < 30} onClick={() => setPage(page + 1)}
                className="font-bold disabled:opacity-40" style={{ color: '#1b3f7a' }}>Next →</button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ActivityLogs;