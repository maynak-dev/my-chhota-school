// API base URL from environment variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// User roles (matching backend enum)
export const ROLES = {
  ADMIN: 'ADMIN',
  SUB_ADMIN: 'SUB_ADMIN', // Teacher
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
};

// Attendance statuses
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
};

// Fee statuses
export const FEE_STATUS = {
  PAID: 'PAID',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
};

// Note types
export const NOTE_TYPES = {
  NOTES: 'NOTES',
  WORKSHEET: 'WORKSHEET',
  HOMEWORK: 'HOMEWORK',
};

// Diary entry types
export const DIARY_TYPES = {
  HOMEWORK: 'HOMEWORK',
  REMARK: 'REMARK',
  BEHAVIOR: 'BEHAVIOR',
};

// Days of the week
export const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

// Date format used in the app
export const DATE_FORMAT = 'YYYY-MM-DD';

// Default pagination limit
export const DEFAULT_PAGE_SIZE = 10;

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// Helper: get role-based dashboard route
export const getDashboardRoute = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/users';
    case ROLES.SUB_ADMIN:
      return '/teacher/attendance';
    case ROLES.STUDENT:
      return '/student/videos';
    case ROLES.PARENT:
      return '/parent/child-progress';
    default:
      return '/dashboard';
  }
};

// Helper: get role display name
export const getRoleDisplayName = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.SUB_ADMIN:
      return 'Teacher';
    case ROLES.STUDENT:
      return 'Student';
    case ROLES.PARENT:
      return 'Parent';
    default:
      return role;
  }
};

// Helper: format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper: format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Helper: format time (HH:MM)
export const formatTime = (timeString) => {
  if (!timeString) return '-';
  // timeString is like "09:00"
  return timeString;
};