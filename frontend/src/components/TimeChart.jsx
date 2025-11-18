import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = {
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  primary: '#8b5cf6',
};

const algorithmColors = {
  bcrypt: '#10b981',
  argon2id: '#3b82f6',
  md5: '#ef4444',
  sha1: '#f59e0b',
};

const TimeChart = ({ stats }) => {
  if (!stats) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '3rem', margin: 0 }}></p>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          Chưa có dữ liệu thống kê. Hãy chạy một số job crack để xem biểu đồ!
        </p>
      </div>
    );
  }

  const barData = Object.entries(stats.datasets || {}).map(
    ([algorithm, entries]) => {
      const totalTime = entries.reduce((sum, e) => sum + e.totalTimeMs, 0);
      const totalAttempts = entries.reduce((sum, e) => sum + e.attempts, 0);
      return {
        algorithm,
        avgTime: entries.length ? Math.round(totalTime / entries.length) : 0,
        avgAttempts: entries.length
          ? Math.round(totalAttempts / entries.length)
          : 0,
      };
    }
  );

  const pieData = [
    { name: 'Thành công', value: stats.success || 0, color: COLORS.success },
    { name: 'Thất bại', value: stats.failed || 0, color: COLORS.danger },
    { name: 'Đang chạy', value: stats.running || 0, color: COLORS.warning },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0.75rem',
          color: '#f1f5f9',
        }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: '0.25rem 0 0 0', color: payload[0].color }}>
            {payload[0].value} {payload[0].dataKey === 'avgTime' ? 'ms' : 'attempts'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-grid">
      <div className="chart-card">
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Thời gian crack trung bình
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="algorithm"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              style={{ color: '#cbd5e1' }}
            />
            <YAxis
              unit=" ms"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="avgTime"
              radius={[8, 8, 0, 0]}
            >
              {barData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={algorithmColors[entry.algorithm] || COLORS.primary}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {pieData.length > 0 && (
        <div className="chart-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Tỷ lệ job
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TimeChart;


