import React from 'react';

const statusBadge = (status) => {
  switch (status) {
    case 'completed':
      return <span className="badge success">Completed</span>;
    case 'failed':
      return <span className="badge danger">Failed</span>;
    case 'running':
      return <span className="badge warning">Running</span>;
    case 'cancelled':
      return <span className="badge neutral">Cancelled</span>;
    default:
      return <span className="badge muted">{status}</span>;
  }
};

const CrackResultTable = ({ jobs = [], onCancel, cancellingJobs = [], onDelete, deletingJobs = [] }) => {
  const getAlgorithmBadge = (algorithm) => {
    const badges = {
      bcrypt: { class: 'success' },
      argon2id: { class: 'success' },
      md5: { class: 'danger' },
      sha1: { class: 'danger' },
    };
    const badge = badges[algorithm] || { class: 'neutral' };
    return (
      <span className={`badge ${badge.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        {algorithm}
      </span>
    );
  };

  const getAttackTypeLabel = (attackType) => {
    const labels = {
      dictionary: 'Dictionary',
      bruteforce: 'Brute-force',
      hybrid: 'Hybrid',
      mask: 'Mask',
      rule: 'Rule-based',
      combinator: 'Combinator',
      togglecase: 'Toggle Case',
    };
    return labels[attackType] || attackType;
  };

  if (!jobs.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '3rem', margin: 0 }}></p>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          Chưa có job nào. Hãy tạo job crack để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Thuật toán</th>
            <th>Tấn công</th>
            <th>Wordlist</th>
            <th>Attempts</th>
            <th>Thời gian (ms)</th>
            <th>Tốc độ (attempt/s)</th>
            <th>Kết quả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td>
                <strong style={{ color: 'var(--text-primary)' }}>{job.username}</strong>
              </td>
              <td>{getAlgorithmBadge(job.algorithm)}</td>
              <td>
                <span className="badge neutral" style={{ textTransform: 'capitalize' }}>
                  {getAttackTypeLabel(job.attack_type)}
                </span>
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>{job.wordlist || '—'}</td>
              <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {job.attempts ? job.attempts.toLocaleString() : '—'}
              </td>
              <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                {job.total_time_ms ? job.total_time_ms.toLocaleString() : '—'}
              </td>
              <td style={{ color: 'var(--accent)', fontFamily: 'monospace', fontWeight: 600 }}>
                {job.attempts_per_sec
                  ? Number(job.attempts_per_sec).toFixed(2)
                  : '—'}
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {statusBadge(job.status)}
                  {job.found_password ? (
                    <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                      ✓ Found: <span className="mono">{job.found_password}</span>
                    </span>
                  ) : job.status === 'completed' ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not found</span>
                  ) : null}
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {job.status === 'running' && onCancel ? (
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={cancellingJobs.includes(job.id)}
                      onClick={() => onCancel(job.id)}
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                    >
                      {cancellingJobs.includes(job.id) ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="loading" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                          Đang dừng...
                        </span>
                      ) : (
                        'Dừng'
                      )}
                    </button>
                  ) : null}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa job này? Hành động này không thể hoàn tác.`)) {
                          onDelete(job.id);
                        }
                      }}
                      disabled={deletingJobs.includes(job.id) || cancellingJobs.includes(job.id)}
                      style={{
                        background: deletingJobs.includes(job.id) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: deletingJobs.includes(job.id) ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                        opacity: deletingJobs.includes(job.id) ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!deletingJobs.includes(job.id)) {
                          e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                          e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!deletingJobs.includes(job.id)) {
                          e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                          e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        }
                      }}
                    >
                      {deletingJobs.includes(job.id) ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="loading" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                          Đang xóa...
                        </span>
                      ) : (
                        'Xóa'
                      )}
                    </button>
                  )}
                  {!onCancel && !onDelete && (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrackResultTable;


