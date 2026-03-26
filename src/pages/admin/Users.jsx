import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, Table, Td, LoadingSpinner } from '../../components/UI';

const roleColors = {
  ADMIN: { bg: '#fff0f1', color: '#e63946' },
  SUB_ADMIN: { bg: '#e8f0fe', color: '#1b3f7a' },
  STUDENT: { bg: '#e6f6ef', color: '#2d9e6b' },
  PARENT: { bg: '#fef3c7', color: '#d97706' },
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader title="User Management" subtitle="View and manage all portal users" />

      <Card>
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: '#eaf0fb' }}>
          <h2 className="font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
            All Users
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border rounded-xl text-sm w-full sm:w-56 transition-all"
              style={{ borderColor: '#d1d5db', background: '#fafafa' }}
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <Table headers={['Name', 'Email', 'Role', 'Phone']}>
                {filtered.map((user) => {
                  const rc = roleColors[user.role] || { bg: '#f1f5f9', color: '#64748b' };
                  return (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: '#1b3f7a' }}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <span className="badge" style={{ background: rc.bg, color: rc.color }}>
                          {user.role === 'SUB_ADMIN' ? 'TEACHER' : user.role}
                        </span>
                      </Td>
                      <Td>{user.phone || <span className="text-gray-400">—</span>}</Td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {filtered.map((user) => {
                const rc = roleColors[user.role] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <div key={user.id} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: '#1b3f7a' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className="badge flex-shrink-0" style={{ background: rc.bg, color: rc.color }}>
                      {user.role === 'SUB_ADMIN' ? 'TEACHER' : user.role}
                    </span>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">No users found.</div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Users;
