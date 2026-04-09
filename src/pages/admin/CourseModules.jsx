import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { PageHeader, Card, CardHeader, PrimaryButton, FormInput, FormTextarea, FormGrid, LoadingSpinner } from '../../components/UI';

const CourseModules = () => {
  const { courseId } = useParams();
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', dripDate: '', prerequisiteId: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '', duration: '' });
  const [loading, setLoading] = useState(true);

  const fetchModules = async () => {
    const res = await api.get(`/modules/course/${courseId}`);
    setModules(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, [courseId]);

  const handleAddModule = async (e) => {
    e.preventDefault();
    await api.post('/modules', { ...moduleForm, courseId, order: modules.length });
    fetchModules();
    setShowModuleForm(false);
    setModuleForm({ title: '', description: '', dripDate: '', prerequisiteId: '' });
  };

  const handleAddLesson = async (e, moduleId) => {
    e.preventDefault();
    await api.post('/lessons', { ...lessonForm, moduleId, order: 0, duration: lessonForm.duration ? parseInt(lessonForm.duration) : null });
    fetchModules();
    setShowLessonForm(null);
    setLessonForm({ title: '', content: '', videoUrl: '', duration: '' });
  };

  const handleDeleteModule = async (id) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    await api.delete(`/modules/${id}`);
    fetchModules();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-fade">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <PageHeader title="Course Modules" subtitle="Course → Module → Lesson hierarchy with drip scheduling" />
        <PrimaryButton onClick={() => setShowModuleForm(!showModuleForm)}>
          {showModuleForm ? '✕ Cancel' : '+ Add Module'}
        </PrimaryButton>
      </div>

      {showModuleForm && (
        <Card className="p-5 mb-6">
          <form onSubmit={handleAddModule}>
            <FormGrid cols={2}>
              <FormInput label="Module Title" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} required />
              <FormInput label="Drip Date (unlock date)" type="datetime-local" value={moduleForm.dripDate} onChange={e => setModuleForm({ ...moduleForm, dripDate: e.target.value })} />
              <FormTextarea label="Description" value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
              {modules.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>Prerequisite Module</label>
                  <select className="form-input w-full px-3 py-2.5 border rounded-xl text-sm" style={{ borderColor: '#d1d5db', background: '#fafafa' }}
                    value={moduleForm.prerequisiteId} onChange={e => setModuleForm({ ...moduleForm, prerequisiteId: e.target.value })}>
                    <option value="">None</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              )}
            </FormGrid>
            <div className="mt-4"><PrimaryButton type="submit">Add Module</PrimaryButton></div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {modules.map((mod, mi) => (
          <Card key={mod.id}>
            <div className="px-5 py-4 flex items-center justify-between cursor-pointer"
              style={{ borderBottom: expandedModule === mod.id ? '1px solid #eaf0fb' : 'none' }}
              onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #1b3f7a 0%, #2a5bae 100%)' }}>
                  {mi + 1}
                </span>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: '#0f2447' }}>{mod.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400">{mod.lessons?.length || 0} lessons</span>
                    {mod.dripDate && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>
                        🔒 Unlocks {new Date(mod.dripDate).toLocaleDateString()}
                      </span>
                    )}
                    {mod.prerequisite && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#e0e7ff', color: '#1b3f7a' }}>
                        Requires: {mod.prerequisite.title}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                  className="text-xs font-bold px-2 py-1 rounded" style={{ color: '#e63946' }}>Delete</button>
                <span className="text-gray-400">{expandedModule === mod.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedModule === mod.id && (
              <div className="px-5 py-4">
                {mod.lessons?.map((lesson, li) => (
                  <div key={lesson.id} className="flex items-center gap-3 py-2 ml-4" style={{ borderBottom: '1px solid #f0f4fc' }}>
                    <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: '#e6f6ef', color: '#2d9e6b' }}>{li + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: '#374151' }}>{lesson.title}</p>
                      {lesson.duration && <span className="text-xs text-gray-400">{Math.round(lesson.duration / 60)} min</span>}
                    </div>
                    {lesson.videoUrl && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#e0e7ff', color: '#1b3f7a' }}>📹 Video</span>}
                  </div>
                ))}

                {showLessonForm === mod.id ? (
                  <form onSubmit={(e) => handleAddLesson(e, mod.id)} className="mt-4 p-4 rounded-xl" style={{ background: '#f8faff' }}>
                    <FormGrid cols={2}>
                      <FormInput label="Lesson Title" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
                      <FormInput label="Video URL" value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} />
                      <FormInput label="Duration (seconds)" type="number" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} />
                    </FormGrid>
                    <div className="mt-3 flex gap-2">
                      <PrimaryButton type="submit">Add Lesson</PrimaryButton>
                      <button type="button" onClick={() => setShowLessonForm(null)} className="text-sm font-bold" style={{ color: '#64748b' }}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowLessonForm(mod.id)}
                    className="mt-3 text-sm font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: '#e6f6ef', color: '#2d9e6b' }}>
                    + Add Lesson
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseModules;