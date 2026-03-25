import { useState, useEffect } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [reportType, setReportType] = useState('attendance');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (reportType === 'attendance') {
        res = await api.get('/attendance/report');
      } else if (reportType === 'fee') {
        res = await api.get('/fees/report');
      } else if (reportType === 'performance') {
        res = await api.get('/results/report');
      }
      setData(res.data);
    } catch (err) {
      console.error('Failed to load report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const exportCSV = () => {
    // Simple CSV export
    if (!data) return;
    let csvContent = '';
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      csvContent = `${headers}\n${rows}`;
    } else {
      csvContent = JSON.stringify(data);
    }
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center gap-4 mb-6">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border p-2 rounded">
            <option value="attendance">Attendance Report</option>
            <option value="fee">Fee Report</option>
            <option value="performance">Performance Report</option>
          </select>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Export CSV
          </button>
          <button onClick={fetchReport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Refresh
          </button>
        </div>

        {loading && <div>Loading report...</div>}

        {data && (
          <div className="overflow-x-auto">
            {Array.isArray(data) ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre>{JSON.stringify(data, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;