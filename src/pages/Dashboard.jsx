import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let res;
        if (user.role === 'ADMIN') res = await api.get('/dashboard/admin');
        else if (user.role === 'SUB_ADMIN') res = await api.get('/dashboard/teacher');
        else if (user.role === 'STUDENT') res = await api.get('/dashboard/student');
        else if (user.role === 'PARENT') res = await api.get('/dashboard/parent');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      }
    };
    fetchStats();
  }, [user]);

  if (!stats) return <div className="flex justify-center">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user.role === 'ADMIN' && (
          <>
            <StatCard title="Total Students" value={stats.totalStudents} />
            <StatCard title="Total Teachers" value={stats.totalTeachers} />
            <StatCard title="Total Batches" value={stats.totalBatches} />
            <StatCard title="Total Fees Collected" value={`₹${stats.totalFeesCollected}`} />
            <StatCard title="Attendance Today" value={stats.attendanceToday} />
          </>
        )}
        {user.role === 'SUB_ADMIN' && (
          <>
            <StatCard title="Students in Your Batch" value={stats.students} />
            <StatCard title="Assignments" value={stats.assignments} />
            <StatCard title="Attendance Today" value={stats.attendanceToday} />
          </>
        )}
        {user.role === 'STUDENT' && (
          <>
            <StatCard title="Attendance Days" value={stats.attendanceCount} />
            <StatCard title="Assignments" value={stats.assignmentsCount} />
            <StatCard title="Fee Due" value={`₹${stats.feeDue}`} />
          </>
        )}
        {user.role === 'PARENT' && (
          <>
            <StatCard title="Number of Children" value={stats.children?.length || 0} />
            {/* You can show children names here */}
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default Dashboard;