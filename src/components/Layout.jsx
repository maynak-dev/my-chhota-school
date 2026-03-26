import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
            {/* Role badge */}
            <span
              className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: '#e8f0fe',
                color: '#1b3f7a',
              }}
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
