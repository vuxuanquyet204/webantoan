import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import UserTable from '../components/UserTable';
import { fetchUsers, deleteUser } from '../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    try {
      const { data } = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    setStatus(null);
    try {
      await deleteUser(id);
      setStatus({
        type: 'success',
        message: 'Đã xóa tài khoản thành công!',
      });
      // Reload danh sách sau khi xóa
      await loadUsers();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Không thể xóa tài khoản, vui lòng thử lại',
      });
    } finally {
      setDeletingId(null);
      // Tự động ẩn thông báo sau 3 giây
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <section className="page">
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div>
          <h2>Bảng quan sát hash</h2>
          <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Theo dõi độ dài hash, salt, và tham số của từng thuật toán để phân tích và so sánh
          </p>
        </div>
        <NavLink 
          className="button-link" 
          to="/users/new"
          style={{ 
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            lineHeight: '1.5',
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap'
          }}
        >
          Tạo user mới
        </NavLink>
      </div>

      {status && (
        <div
          className="card result-card"
          style={{
            marginBottom: '1rem',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            borderColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
          }}
        >
          <p
            className={status.type === 'success' ? 'text-success' : 'text-error'}
            style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}
          >
            {status.message}
          </p>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="loading" style={{ margin: '0 auto', display: 'block', width: '40px', height: '40px', borderWidth: '4px' }}></span>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <UserTable users={users} onDelete={handleDelete} deletingId={deletingId} />
      )}
    </section>
  );
};

export default UserList;


