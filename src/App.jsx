import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Admin Pages
import Users from './pages/admin/Users';
import Admissions from './pages/admin/Admissions';
import Batches from './pages/admin/Batches';
import FeeManagement from './pages/admin/FeeManagement';
import Reports from './pages/admin/Reports';

// Teacher Pages
import Attendance from './pages/teacher/Attendance';
import Notes from './pages/teacher/Notes';
import Assignments from './pages/teacher/Assignments';
import Timetable from './pages/teacher/Timetable';
import LessonPlanner from './pages/teacher/LessonPlanner';
import StudentList from './pages/teacher/StudentList';

// Student Pages
import StudentVideos from './pages/student/Videos';
import StudentNotes from './pages/student/Notes';
import StudentAttendance from './pages/student/Attendance';
import StudentFees from './pages/student/Fees';
import StudentResults from './pages/student/Results';

// Parent Pages
import ChildProgress from './pages/parent/ChildProgress';
import ParentFeeDetails from './pages/parent/FeeDetails';
import ParentTimetable from './pages/parent/Timetable';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/admissions" element={<Admissions />} />
              <Route path="/admin/batches" element={<Batches />} />
              <Route path="/admin/fees" element={<FeeManagement />} />
              <Route path="/admin/reports" element={<Reports />} />
              
              {/* Teacher Routes */}
              <Route path="/teacher/attendance" element={<Attendance />} />
              <Route path="/teacher/notes" element={<Notes />} />
              <Route path="/teacher/assignments" element={<Assignments />} />
              <Route path="/teacher/timetable" element={<Timetable />} />
              <Route path="/teacher/lesson-planner" element={<LessonPlanner />} />
              <Route path="/teacher/students" element={<StudentList />} />
              
              {/* Student Routes */}
              <Route path="/student/videos" element={<StudentVideos />} />
              <Route path="/student/notes" element={<StudentNotes />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/fees" element={<StudentFees />} />
              <Route path="/student/results" element={<StudentResults />} />
              
              {/* Parent Routes */}
              <Route path="/parent/child-progress" element={<ChildProgress />} />
              <Route path="/parent/fees" element={<ParentFeeDetails />} />
              <Route path="/parent/timetable" element={<ParentTimetable />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;