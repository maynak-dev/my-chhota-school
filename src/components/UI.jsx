// Reusable UI building blocks for My Chhota School ERP

export const PageHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1
      className="text-2xl sm:text-3xl font-bold"
      style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}
    >
      {title}
    </h1>
    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
  </div>
);

export const Card = ({ children, className = '', style = {} }) => (
  <div
    className={`bg-white rounded-2xl ${className}`}
    style={{ boxShadow: '0 2px 14px rgba(27,63,122,0.07)', ...style }}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, children }) => (
  <div className="px-5 py-4 border-b flex items-center justify-between gap-3" style={{ borderColor: '#eaf0fb' }}>
    <h2 className="font-bold text-base" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
      {title}
    </h2>
    {children}
  </div>
);

export const FormGrid = ({ children, cols = 2 }) => (
  <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : cols === 3 ? 'md:grid-cols-3' : ''} gap-4`}>
    {children}
  </div>
);

export const FormInput = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
        {label}
      </label>
    )}
    <input
      className="form-input w-full px-3 py-2.5 border rounded-xl text-sm transition-all"
      style={{ borderColor: '#d1d5db', background: '#fafafa' }}
      {...props}
    />
  </div>
);

export const FormSelect = ({ label, children, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
        {label}
      </label>
    )}
    <select
      className="form-input w-full px-3 py-2.5 border rounded-xl text-sm transition-all appearance-none"
      style={{ borderColor: '#d1d5db', background: '#fafafa' }}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const FormTextarea = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="block text-sm font-semibold mb-1.5" style={{ color: '#374151' }}>
        {label}
      </label>
    )}
    <textarea
      className="form-input w-full px-3 py-2.5 border rounded-xl text-sm transition-all resize-none"
      style={{ borderColor: '#d1d5db', background: '#fafafa' }}
      {...props}
    />
  </div>
);

export const PrimaryButton = ({ children, loading, className = '', ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 ${className}`}
    style={{
      background: 'linear-gradient(135deg, #1b3f7a 0%, #2a5bae 100%)',
      boxShadow: '0 4px 12px rgba(27,63,122,0.3)',
    }}
    disabled={loading}
    {...props}
  >
    {loading ? (
      <>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Processing...
      </>
    ) : children}
  </button>
);

export const GreenButton = ({ children, loading, ...props }) => (
  <button
    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
    style={{ background: 'linear-gradient(135deg, #2d9e6b 0%, #22c55e 100%)', boxShadow: '0 4px 12px rgba(45,158,107,0.3)' }}
    disabled={loading}
    {...props}
  >
    {loading ? (
      <>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Processing...
      </>
    ) : children}
  </button>
);

export const StatusBadge = ({ status }) => {
  const map = {
    PAID: { bg: '#e6f6ef', color: '#2d9e6b', label: 'Paid' },
    OVERDUE: { bg: '#fff0f1', color: '#e63946', label: 'Overdue' },
    PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
    PRESENT: { bg: '#e6f6ef', color: '#2d9e6b', label: 'Present' },
    ABSENT: { bg: '#fff0f1', color: '#e63946', label: 'Absent' },
    LATE: { bg: '#fef3c7', color: '#d97706', label: 'Late' },
  };
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
  return (
    <span className="badge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

export const Table = ({ headers, children, empty = 'No data found.' }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full">
      <thead>
        <tr style={{ background: '#f8faff' }}>
          {headers.map((h) => (
            <th
              key={h}
              className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
              style={{ color: '#6b7280', borderBottom: '2px solid #eaf0fb' }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y" style={{ borderColor: '#f0f4fc' }}>
        {children}
      </tbody>
    </table>
    {!children || (Array.isArray(children) && children.length === 0) ? (
      <div className="py-12 text-center text-gray-400 text-sm">{empty}</div>
    ) : null}
  </div>
);

export const Td = ({ children, className = '' }) => (
  <td className={`px-5 py-3.5 text-sm text-gray-700 ${className}`}>{children}</td>
);

export const SuccessMessage = ({ msg }) =>
  msg ? (
    <div className="flex items-center gap-2 p-3 rounded-xl text-sm mt-4"
      style={{ background: '#e6f6ef', color: '#2d9e6b', border: '1px solid #c3e9d8' }}>
      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      {msg}
    </div>
  ) : null;

export const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center py-16 gap-3">
    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: '#1b3f7a' }}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <span className="text-gray-500 text-sm">{text}</span>
  </div>
);
