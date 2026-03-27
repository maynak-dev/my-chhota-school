import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Layout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Poll unread notifications for admin
  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'SUB_ADMIN') return;
    const fetchCount = () => {
      api.get('/notifications/unread-count')
        .then(r => setUnreadCount(r.data.count))
        .catch(() => {});
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user?.role]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f5ff' }}>
      <Sidebar
        role={user?.role}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b"
          style={{
            background: '#ffffff',
            borderColor: '#e2eaf8',
            boxShadow: '0 1px 8px rgba(27,63,122,0.06)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: '#1b3f7a' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1
                className="font-bold text-base sm:text-lg leading-tight"
                style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}
              >
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell — admin only */}
            {(user?.role === 'ADMIN' || user?.role === 'SUB_ADMIN') && (
              <button
                onClick={() => navigate('/admin/notifications')}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#1b3f7a' }}
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-white font-bold rounded-full"
                    style={{
                      background: '#e63946',
                      fontSize: '9px',
                      minWidth: '16px',
                      height: '16px',
                      padding: '0 3px',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Role badge */}
            <span
              className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: '#e8f0fe', color: '#1b3f7a' }}
            >
              {user?.role === 'SUB_ADMIN' ? 'TEACHER' : user?.role}
            </span>
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#2d9e6b' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 page-fade">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
