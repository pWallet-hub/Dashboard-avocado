import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('https://pwallet-api.onrender.com/api/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Reports</h1>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Agent Name</th>
            <th className="px-4 py-2 border-b">Report Title</th>
            <th className="px-4 py-2 border-b">Description</th>
            <th className="px-4 py-2 border-b">Date</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b">{report.agentName}</td>
              <td className="px-4 py-2 border-b">{report.title}</td>
              <td className="px-4 py-2 border-b">{report.description}</td>
              <td className="px-4 py-2 border-b">{new Date(report.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}