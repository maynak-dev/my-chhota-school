import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';


// Admin Pages
import Notifications from './pages/admin/Notifications';
import Users from './pages/admin/Users';
import Admissions from './pages/admin/Admissions';
import Batches from './pages/admin/Batches';
import Courses from './pages/admin/Courses';
import FeeManagement from './pages/admin/FeeManagement';
import Reports from './pages/admin/Reports';
import AdminTimetable from './pages/admin/AdminTimetable';
import AdminExams from './pages/admin/Exams';
import Expenses from './pages/admin/Expenses';
import Payroll from './pages/admin/Payroll';
import AdminLeaves from './pages/admin/Leaves';

// Teacher Pages
import Attendance from './pages/teacher/Attendance';
import Notes from './pages/teacher/Notes';
import TeacherVideos from './pages/teacher/Videos';
import Assignments from './pages/teacher/Assignments';
import Timetable from './pages/teacher/Timetable';
import LessonPlanner from './pages/teacher/LessonPlanner';
import StudentList from './pages/teacher/StudentList';
import TeacherResults from './pages/teacher/Results';
import TeacherDiary from './pages/teacher/Diary';
import TeacherLeaves from './pages/teacher/Leaves';
// Student Pages
import StudentVideos from './pages/student/Videos';
import StudentNotes from './pages/student/Notes';
import StudentAssignments from './pages/student/Assignments';
import StudentAttendance from './pages/student/Attendance';
import StudentFees from './pages/student/Fees';
import StudentResults from './pages/student/Results';
import StudentProfile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';
import StudentDiary from './pages/student/Diary';

// Parent Pages
import ChildProgress from './pages/parent/ChildProgress';
import ParentFeeDetails from './pages/parent/FeeDetails';
import ParentTimetable from './pages/parent/Timetable';
import ParentNotifications from './pages/parent/Notifications';

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
              <Route path="/admin/courses" element={<Courses />} />
              <Route path="/admin/batches" element={<Batches />} />
              <Route path="/admin/fees" element={<FeeManagement />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/timetable" element={<AdminTimetable />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/admin/expenses" element={<Expenses />} />
              <Route path="/admin/payroll" element={<Payroll />} />
              <Route path="/admin/leaves" element={<AdminLeaves />} />

              {/* Teacher Routes */}
              <Route path="/teacher/attendance" element={<Attendance />} />
              <Route path="/teacher/notes" element={<Notes />} />
              <Route path="/teacher/videos" element={<TeacherVideos />} />
              <Route path="/teacher/assignments" element={<Assignments />} />
              <Route path="/teacher/timetable" element={<Timetable />} />
              <Route path="/teacher/lesson-planner" element={<LessonPlanner />} />
              <Route path="/teacher/students" element={<StudentList />} />
              <Route path="/teacher/results" element={<TeacherResults />} />
              <Route path="/teacher/diary" element={<TeacherDiary />} />
              <Route path="/teacher/leaves" element={<TeacherLeaves />} />

              {/* Student Routes */}
              <Route path="/student/videos" element={<StudentVideos />} />
              <Route path="/student/notes" element={<StudentNotes />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/fees" element={<StudentFees />} />
              <Route path="/student/results" element={<StudentResults />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />
              <Route path="/student/diary" element={<StudentDiary />} />

              {/* Parent Routes */}
              <Route path="/parent/child-progress" element={<ChildProgress />} />
              <Route path="/parent/fees" element={<ParentFeeDetails />} />
              <Route path="/parent/timetable" element={<ParentTimetable />} />
              <Route path="/parent/notifications" element={<ParentNotifications />} />

            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
