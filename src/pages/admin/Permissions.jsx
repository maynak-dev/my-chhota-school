import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormSelect, FormGrid, LoadingSpinner } from '../../components/UI';

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [rolePerms, setRolePerms] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/permissions').then(res => { setPermissions(res.data); setLoading(false); });
  }, []);

  useEffect(() => {
    api.get(`/permissions/role/${selectedRole}`).then(res => {
      setRolePerms(res.data.map(p => p.id));
    });
  }, [selectedRole]);

  const togglePerm = (permId) => {
    setRolePerms(prev => prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]);
  };

  const handleSave = async () => {
    setSaving(true);
    await api.put(`/permissions/role/${selectedRole}`, { permissionIds: rolePerms });
    setSaving(false);
    alert('Permissions updated!');
  };

  const handleAddPerm = async (e) => {
    e.preventDefault();
    const res = await api.post('/permissions', newPerm);
    setPermissions([...permissions, res.data]);
    setShowAdd(false);
    setNewPerm({ name: '', description: '' });
  };

  if (loading) return <LoadingSpinner />;

  const roles = ['ADMIN', 'SUB_ADMIN', 'STUDENT', 'PARENT'];

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Permissions (RBAC)" subtitle="Role-based dynamic permission management" />
        <PrimaryButton onClick={() => setShowAdd(!showAdd)}>{showAdd ? '✕ Cancel' : '+ Add Permission'}</PrimaryButton>
      </div>

      {showAdd && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleAddPerm}>
            <FormGrid cols={2}>
              <FormInput label="Permission Name" value={newPerm.name} onChange={e => setNewPerm({ ...newPerm, name: e.target.value })} placeholder="manage_users" required />
              <FormInput label="Description" value={newPerm.description} onChange={e => setNewPerm({ ...newPerm, description: e.target.value })} />
            </FormGrid>
            <div className="mt-4"><PrimaryButton type="submit">Add Permission</PrimaryButton></div>
          </form>
        </Card>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {roles.map(r => (
          <button key={r} onClick={() => setSelectedRole(r)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: selectedRole === r ? '#1b3f7a' : '#e0e7ff', color: selectedRole === r ? '#fff' : '#1b3f7a' }}>
            {r.replace('_', ' ')}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={`Permissions for ${selectedRole.replace('_', ' ')}`}>
          <PrimaryButton onClick={handleSave} loading={saving}>Save Changes</PrimaryButton>
        </CardHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
          {permissions.map(p => (
            <label key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: rolePerms.includes(p.id) ? '#eef2ff' : '#fafafa',
                border: `1.5px solid ${rolePerms.includes(p.id) ? '#1b3f7a' : '#e5e7eb'}`,
              }}>
              <input type="checkbox" checked={rolePerms.includes(p.id)}
                onChange={() => togglePerm(p.id)}
                className="w-4 h-4 rounded" style={{ accentColor: '#1b3f7a' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#0f2447' }}>{p.name}</p>
                {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
              </div>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Permissions;