import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PageHeader, Card, CardHeader, FormGrid, FormInput, FormTextarea,
  PrimaryButton, Table, Td,
} from '../../components/UI';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch {}
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/courses/${editId}`, form);
      } else {
        await api.post('/courses', form);
      }
      setForm({ name: '', description: '' });
      setEditId(null);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditId(course.id);
    setForm({ name: course.name, description: course.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All batches under it must be removed first.')) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ name: '', description: '' });
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Courses" subtitle="Create and manage courses" />

      <Card>
        <CardHeader title={editId ? 'Edit Course' : 'Create New Course'} />
        <div className="p-5">
          <form onSubmit={handleSubmit}>
            <FormGrid cols={1}>
              <FormInput
                label="Course Name"
                type="text"
                name="name"
                placeholder="e.g. Mathematics, Science, English"
                value={form.name}
                onChange={handleChange}
                required
              />
              <FormTextarea
                label="Description (optional)"
                name="description"
                placeholder="Brief description of the course"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </FormGrid>
            <div className="mt-5 flex gap-3">
              <PrimaryButton type="submit" loading={loading}>
                {editId ? '✏️ Update Course' : '📖 Create Course'}
              </PrimaryButton>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{ background: '#f1f5f9', color: '#64748b' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <CardHeader title={`All Courses (${courses.length})`} />

        {/* Desktop */}
        <div className="hidden sm:block">
          <Table headers={['Course Name', 'Description', 'Batches', 'Actions']}>
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-blue-50 transition-colors">
                <Td><span className="font-semibold">{c.name}</span></Td>
                <Td>{c.description || <span className="text-gray-400">—</span>}</Td>
                <Td>
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                    style={{ background: '#1b3f7a' }}
                  >
                    {c.batches?.length || 0}
                  </span>
                </Td>
                <Td>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: '#eaf0fb', color: '#1b3f7a' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: '#fff0f1', color: '#e63946' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y" style={{ borderColor: '#f0f4fc' }}>
          {courses.map((c) => (
            <div key={c.id} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#0f2447' }}>{c.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.description || 'No description'} · {c.batches?.length || 0} batches
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: '#eaf0fb', color: '#1b3f7a' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: '#fff0f1', color: '#e63946' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">No courses created yet.</div>
        )}
      </Card>
    </div>
  );
};

export default Courses;
