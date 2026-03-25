import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ role }) => {
  const { logout } = useAuth();

  const adminLinks = [
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/admissions', label: 'Admissions' },
    { to: '/admin/batches', label: 'Batches' },
    { to: '/admin/fees', label: 'Fee Management' },
    { to: '/admin/reports', label: 'Reports' },
  ];

  const teacherLinks = [
    { to: '/teacher/attendance', label: 'Attendance' },
    { to: '/teacher/notes', label: 'Notes' },
    { to: '/teacher/assignments', label: 'Assignments' },
    { to: '/teacher/timetable', label: 'Timetable' },
    { to: '/teacher/lesson-planner', label: 'Lesson Planner' },
    { to: '/teacher/students', label: 'Student List' },
  ];

  const studentLinks = [
    { to: '/student/videos', label: 'Videos' },
    { to: '/student/notes', label: 'Notes' },
    { to: '/student/attendance', label: 'Attendance' },
    { to: '/student/fees', label: 'Fees' },
    { to: '/student/results', label: 'Results' },
  ];

  const parentLinks = [
    { to: '/parent/child-progress', label: 'Child Progress' },
    { to: '/parent/fees', label: 'Fee Details' },
    { to: '/parent/timetable', label: 'Timetable' },
  ];

  let links = [];
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'SUB_ADMIN') links = teacherLinks;
  else if (role === 'STUDENT') links = studentLinks;
  else if (role === 'PARENT') links = parentLinks;

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-700">LMS Portal</div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block py-2 px-4 rounded transition ${isActive ? 'bg-gray-900' : 'hover:bg-gray-700'}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block py-2 px-4 rounded transition ${isActive ? 'bg-gray-900' : 'hover:bg-gray-700'}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;