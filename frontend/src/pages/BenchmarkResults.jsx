import React, { useEffect, useMemo, useState } from 'react';
import TimeChart from '../components/TimeChart';
import CrackResultTable from '../components/CrackResultTable';
import { fetchCrackJobs, fetchCrackStats } from '../services/api';

const BenchmarkResults = () => {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);

  const load = async () => {
    const [{ data: statsData }, { data: jobsData }] = await Promise.all([
      fetchCrackStats(),
      fetchCrackJobs(),
    ]);
    setStats(statsData);
    setJobs(jobsData);
  };

  useEffect(() => {
    load();
  }, []);

  const averageTable = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.datasets || {}).map(([algorithm, entries]) => {
      const totalTime = entries.reduce((sum, e) => sum + e.totalTimeMs, 0);
      const totalAttempts = entries.reduce((sum, e) => sum + e.attempts, 0);
      return {
        algorithm,
        jobs: entries.length,
        time: entries.length ? (totalTime / entries.length / 1000).toFixed(2) : '—',
        attempts: entries.length ? Math.round(totalAttempts / entries.length) : '—',
      };
    });
  }, [stats]);

  return (
    <section className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Trang so sánh & biểu đồ</h2>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Quan sát sự khác biệt về hiệu năng và độ an toàn giữa MD5/SHA1 và bcrypt/argon2id
        </p>
      </div>

      {stats && <TimeChart stats={stats} />}

      {averageTable.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            Bảng thống kê trung bình
          </h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Thuật toán</th>
                  <th>Số job</th>
                  <th>Thời gian trung bình (s)</th>
                  <th>Attempts trung bình</th>
                </tr>
              </thead>
              <tbody>
                {averageTable.map((row) => (
                  <tr key={row.algorithm}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{row.algorithm}</strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.jobs}</td>
                    <td style={{ color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 600 }}>
                      {row.time}s
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {typeof row.attempts === 'number' ? row.attempts.toLocaleString() : row.attempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Chi tiết job</h3>
        <CrackResultTable jobs={jobs} />
      </div>
    </section>
  );
};

export default BenchmarkResults;


