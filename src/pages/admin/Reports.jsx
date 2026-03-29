import { useState, useEffect } from 'react';
import api from '../../services/api';
import { PageHeader, Card, GreenButton, PrimaryButton, LoadingSpinner } from '../../components/UI';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    { value: 'attendance', label: 'Attendance Report', icon: '📅', color: '#1b3f7a', bg: '#e8f0fe' },
    { value: 'fee', label: 'Fee Report', icon: '💰', color: '#2d9e6b', bg: '#e6f6ef' },
    { value: 'performance', label: 'Performance Report', icon: '📊', color: '#f59e0b', bg: '#fef3c7' },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (reportType === 'attendance') {
        // Replace with your actual attendance report endpoint
        res = await api.get('/attendance/report');
        setData(res.data);
      } 
      else if (reportType === 'fee') {
        // ✅ Fee report: fetch all fees and transform into a readable report
        const feesRes = await api.get('/fees');
        const fees = feesRes.data;
        
        // Transform fee data into report rows
        const reportData = fees.map(fee => ({
          'Student Name': fee.student?.user?.name || 'N/A',
          'Roll Number': fee.student?.rollNumber || 'N/A',
          'Total Fees (₹)': fee.totalFees || 0,
          'Paid Amount (₹)': fee.paidAmount || 0,
          'Balance (₹)': (fee.totalFees || 0) - (fee.paidAmount || 0),
          'Due Date': fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'No due date',
          'Status': fee.status || 'PENDING',
        }));
        setData(reportData);
      } 
      else if (reportType === 'performance') {
        // Replace with your actual results report endpoint
        res = await api.get('/results/report');
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const exportCSV = () => {
    if (!data || (Array.isArray(data) && data.length === 0)) return;
    
    let csvRows = [];
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0]);
      csvRows.push(headers.join(','));
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          // Escape commas and quotes
          return typeof val === 'string' && (val.includes(',') || val.includes('"')) 
            ? `"${val.replace(/"/g, '""')}"` 
            : val;
        });
        csvRows.push(values.join(','));
      }
    } else {
      // Fallback for non-array data
      csvRows.push(JSON.stringify(data));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const active = reportOptions.find((r) => r.value === reportType);

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" subtitle="Generate and export school data reports" />

      {/* Report type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reportOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setReportType(opt.value)}
            className="p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3"
            style={{
              background: reportType === opt.value ? opt.bg : '#ffffff',
              border: reportType === opt.value ? `2px solid ${opt.color}` : '2px solid transparent',
              boxShadow: '0 2px 12px rgba(27,63,122,0.07)',
            }}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="font-semibold text-sm" style={{ color: reportType === opt.value ? opt.color : '#374151' }}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3" style={{ borderColor: '#eaf0fb' }}>
          <h2 className="font-bold text-base flex items-center gap-2" style={{ fontFamily: 'Baloo 2, cursive', color: '#0f2447' }}>
            <span>{active?.icon}</span>
            {active?.label}
          </h2>
          <div className="flex gap-2">
            <PrimaryButton onClick={fetchReport}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </PrimaryButton>
            <GreenButton onClick={exportCSV}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </GreenButton>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          ) : data && Array.isArray(data) && data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ background: '#f8faff' }}>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                        style={{ borderBottom: '2px solid #eaf0fb' }}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#f0f4fc' }}>
                  {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-5 py-3.5 text-sm text-gray-700">
                          {typeof val === 'number' && key.includes('₹') 
                            ? `₹${val.toLocaleString()}` 
                            : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : data && !Array.isArray(data) ? (
            <pre className="text-xs text-gray-500 overflow-auto bg-gray-50 p-4 rounded-xl">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">No report data available.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;