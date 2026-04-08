import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/my-profile')
      .then(res => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!profile) return <div className="p-6 text-red-500">Could not load profile.</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        <div><span className="font-semibold">Name:</span> {profile.user?.name}</div>
        <div><span className="font-semibold">Email:</span> {profile.user?.email}</div>
        <div><span className="font-semibold">Phone:</span> {profile.user?.phone || 'N/A'}</div>
        <div><span className="font-semibold">Roll Number:</span> {profile.rollNumber}</div>
        <div><span className="font-semibold">Batch:</span> {profile.batch?.name}</div>
        <div><span className="font-semibold">Course:</span> {profile.batch?.course?.name}</div>
      </div>
    </div>
  );
}