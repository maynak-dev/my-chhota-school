import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, FormGrid, FormInput, FormSelect, PrimaryButton, Table, Td, LoadingSpinner } from '../../components/UI';

const ROLE_META = {
  ADMIN: { label: 'Admin', bg: '#fff0f1', color: '#e63946', icon: '🛡️',
    permissions: ['Full system access', 'Manage all users', 'Fee management', 'Reports & analytics', 'All teacher features'] },
  SUB_ADMIN: { label: 'Teacher / Staff', bg: '#e8f0fe', color: '#1b3f7a', icon: '👩‍🏫',
    permissions: ['Attendance marking', 'Notes & assignments', 'Timetable management', 'Student list view', 'Lesson planning'] },
  STUDENT: { label: 'Student', bg: '#e6f6ef', color: '#2d9e6b', icon: '🎓', permissions: [] },
  PARENT: { label: 'Parent', bg: '#fef3c7', color: '#d97706', icon: '👨‍👩‍👧', permissions: [] },
};

const emptyForm = { name: '', email: '', password: '', phone: '', role: 'SUB_ADMIN', subject: '', qualification: '' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg(''); setIsError(false);
    try {
      await api.post('/users', form);
      setMsg(`✅ ${form.role === 'SUB_ADMIN' ? 'Teacher/Staff' : 'Admin'} account created for ${form.name}.`);
      setIsError(false);
      setForm(emptyForm);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to create user.');
      setIsError(true);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    } finally { setDeleting(false); }
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleCounts = { ALL: users.length, ADMIN: 0, SUB_ADMIN: 0, STUDENT: 0, PARENT: 0 };
  users.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });

  const selectedRoleMeta = ROLE_META[form.role];

  return (
    <div className="space-y-5">
      <PageHeader title="User Management" subtitle="Create staff accounts, assign roles and view all portal users" />

      {/* Global message */}
      {msg && (
        <div className="px-4 py-3 rounded-xl text-sm font-medium"
          style={{ background: isError ? '#fff0f1' : '#e6f6ef', color: isError ? '#e63946' : '#2d9e6b', border: `1px solid ${isError ? '#fbc8cb' : '#b7e9d0'}` }}>
          {msg}
          <button onClick={() => setMsg('')} className="ml-3 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Create Staff Card */}
      <Card>
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>Create Staff / Teacher Account</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add new admin or teacher with login credentials and role-based permissions</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setMsg(''); }}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
            style={{ background: showForm ? '#e63946' : 'linear-gradient(135deg, #1b3f7a, #2d9e6b)' }}
          >
            {showForm ? '✕ Cancel' : '+ New User'}
          </button>
        </div>

        {showForm && (
          <div className="px-5 pb-5">
            <div className="h-px mb-5" style={{ background: '#eaf0fb' }} />
            <form onSubmit={handleSubmit}>
              <FormGrid cols={2}>
                <FormInput label="Full Name" type="text" name="name" placeholder="Enter full name"
                  value={form.name} onChange={handleChange} required />
                <FormInput label="Email Address" type="email" name="email" placeholder="Login email"
                  value={form.email} onChange={handleChange} required />
                <FormInput label="Password" type="password" name="password" placeholder="Set login password"
                  value={form.password} onChange={handleChange} required />
                <FormInput label="Phone Number" type="tel" name="phone" placeholder="Enter phone (optional)"
                  value={form.phone} onChange={handleChange} />
                <FormSelect label="Role" name="role" value={form.role} onChange={handleChange} required>
                  <option value="SUB_ADMIN">👩‍🏫 Teacher / Staff</option>
                  <option value="ADMIN">🛡️ Admin</option>
                </FormSelect>
                {form.role === 'SUB_ADMIN' && (
                  <FormInput label="Subject" type="text" name="subject" placeholder="E.g. Mathematics"
                    value={form.subject} onChange={handleChange} />
                )}
                {form.role === 'SUB_ADMIN' && (
                  <div className="md:col-span-2">
                    <FormInput label="Qualification" type="text" name="qualification" placeholder="E.g. B.Ed, M.Sc"
                      value={form.qualification} onChange={handleChange} />
                  </div>
                )}
              </FormGrid>

              {/* Permissions preview */}
              <div className="mt-4 p-4 rounded-2xl" style={{ background: '#f8faff', border: '1.5px solid #e8f0fe' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#1b3f7a' }}>
                  {selectedRoleMeta?.icon} Permissions for {selectedRoleMeta?.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoleMeta?.permissions.map(p => (
                    <span key={p} className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: '#e8f0fe', color: '#1b3f7a' }}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <PrimaryButton type="submit" loading={submitting}>
                  👤 Create {form.role === 'SUB_ADMIN' ? 'Teacher/Staff' : 'Admin'} Account
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}
      </Card>

      {/* Users List */}
      <Card>
        {/* Filters */}
        <div className="px-5 pt-5 pb-4 border-b flex flex-col gap-3" style={{ borderColor: '#eaf0fb' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
              All Users <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
            </h2>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input type="text" placeholder="Search users..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-xl text-sm w-full sm:w-56"
                style={{ borderColor: '#d1d5db', background: '#fafafa' }} />
            </div>
          </div>

          {/* Role filter tabs */}
          <div className="flex flex-wrap gap-2">
            {['ALL', 'ADMIN', 'SUB_ADMIN', 'STUDENT', 'PARENT'].map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: filterRole === r ? '#1b3f7a' : '#f0f4fc',
                  color: filterRole === r ? '#fff' : '#555',
                }}>
                {r === 'ALL' ? `All (${roleCounts.ALL})` :
                  r === 'SUB_ADMIN' ? `Teacher (${roleCounts.SUB_ADMIN})` :
                  `${r} (${roleCounts[r]})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="py-10"><LoadingSpinner /></div> : (
          <>
            {/* Desktop */}
            <div className="hidden sm:block">
              <Table headers={['Name & Email', 'Role', 'Phone', 'Actions']}>
                {filtered.map(user => {
                  const rc = ROLE_META[user.role] || { bg: '#f1f5f9', color: '#64748b', icon: '👤', label: user.role };
                  return (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: '#1b3f7a' }}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="px-2 py-1 rounded-lg text-xs font-bold"
                          style={{ background: rc.bg, color: rc.color }}>
                          {rc.icon} {rc.label}
                        </span>
                      </Td>
                      <Td>{user.phone || <span className="text-gray-400">—</span>}</Td>
                      <Td>
                        {user.role !== 'ADMIN' && (
                          <button onClick={() => setDeleteId(user.id)}
                            className="text-xs font-semibold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                            style={{ background: '#fff0f1', color: '#e63946' }}>
                            🗑 Remove
                          </button>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </Table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
              {filtered.map(user => {
                const rc = ROLE_META[user.role] || { bg: '#f1f5f9', color: '#64748b', icon: '👤', label: user.role };
                return (
                  <div key={user.id} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: '#1b3f7a' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{ background: rc.bg, color: rc.color }}>{rc.icon} {rc.label}</span>
                      {user.role !== 'ADMIN' && (
                        <button onClick={() => setDeleteId(user.id)}
                          className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                          style={{ background: '#fff0f1', color: '#e63946' }}>
                          🗑 Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && <div className="py-12 text-center text-gray-400 text-sm">No users found.</div>}
          </>
        )}
      </Card>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" style={{ border: '1.5px solid #fbc8cb' }}>
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-bold text-base" style={{ color: '#e63946' }}>Remove User?</h3>
              <p className="text-sm text-gray-500 mt-1">This will permanently delete the user and all associated data. This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: '#f0f4fc', color: '#1b3f7a' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60"
                style={{ background: '#e63946' }}>
                {deleting ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
