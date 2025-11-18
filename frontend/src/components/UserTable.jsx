import React from 'react';

const UserTable = ({ users = [], onDelete, deletingId }) => {
  const getAlgorithmBadge = (algorithm) => {
    const badges = {
      bcrypt: { label: 'bcrypt', class: 'success' },
      argon2id: { label: 'argon2id', class: 'success' },
      md5: { label: 'MD5', class: 'danger' },
      sha1: { label: 'SHA1', class: 'danger' },
    };
    const badge = badges[algorithm] || { label: algorithm, class: 'neutral' };
    return (
      <span className={`badge ${badge.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        {badge.label}
      </span>
    );
  };

  if (!users.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '3rem', margin: 0 }}></p>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '1.1rem' }}>
          Chưa có user nào. Hãy tạo tài khoản mới để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Thuật toán</th>
            <th>Hash</th>
            <th>Salt</th>
            <th>Tham số</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
              </td>
              <td>{getAlgorithmBadge(user.algorithm)}</td>
              <td className="mono hash-col" title={user.hash}>
                {user.hash}
              </td>
              <td className="mono" style={{ fontSize: '0.8rem' }}>
                {user.salt ? (
                  <span title={user.salt} style={{ color: 'var(--accent)' }}>
                    {user.salt.length > 20 ? `${user.salt.substring(0, 20)}...` : user.salt}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                )}
              </td>
              <td>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'auto',
                    maxWidth: '200px',
                  }}
                >
                  {JSON.stringify(user.params || {}, null, 2)}
                </pre>
              </td>
              <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {new Date(user.created_at).toLocaleString('vi-VN')}
              </td>
              <td>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.username}"? Hành động này không thể hoàn tác.`)) {
                        onDelete(user.id);
                      }
                    }}
                    disabled={deletingId === user.id}
                    style={{
                      background: deletingId === user.id ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: deletingId === user.id ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      opacity: deletingId === user.id ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== user.id) {
                        e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (deletingId !== user.id) {
                        e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }
                    }}
                  >
                    {deletingId === user.id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="loading" style={{ width: '12px', height: '12px', borderWidth: '2px' }}></span>
                        Đang xóa...
                      </span>
                    ) : (
                      'Xóa'
                    )}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;


