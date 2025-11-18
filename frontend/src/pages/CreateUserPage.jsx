import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AlgorithmSelector from '../components/AlgorithmSelector';
import { registerUser } from '../services/api';

const initialFormState = {
  username: '',
  email: '',
  password: '',
};

const CreateUserPage = () => {
  const [form, setForm] = useState(initialFormState);
  const [algorithm, setAlgorithm] = useState('bcrypt');
  const [params, setParams] = useState({});
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { data } = await registerUser({ ...form, algorithm, params });
      setStatus({
        type: 'success',
        message: 'Đã khởi tạo user mới trong lab!',
        details: data,
      });
      setForm(initialFormState);
      setParams({});
      setAlgorithm('bcrypt');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tạo user, vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h2>Tạo user hash sau khi đăng nhập</h2>
          <p style={{ fontSize: '1.05rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Tạo thêm tài khoản demo để thử nghiệm thuật toán hash mà không cần đăng xuất khỏi lab.
          </p>
        </div>
        <NavLink 
          className="button-link" 
          to="/users"
          style={{ 
            padding: '8px 16px',
            fontSize: '0.9rem',
            fontWeight: 600,
            lineHeight: '1.2',
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            marginTop: 0
          }}
        >
          ← Quay lại bảng hash
        </NavLink>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <form className="card" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Username
              </span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Tên người dùng demo"
                required
              />
            </label>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Email
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Password để hash
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu sẽ được hash"
                required
              />
            </label>
            <small className="muted" style={{ display: 'block', marginTop: '0.35rem' }}>
              Mật khẩu này chỉ dùng để sinh hash demo, không phải mật khẩu đăng nhập hiện tại của bạn.
            </small>
          </div>

          <AlgorithmSelector
            algorithm={algorithm}
            params={params}
            onAlgorithmChange={setAlgorithm}
            onParamsChange={setParams}
          />

          <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="loading"></span>
                Đang tạo user...
              </span>
            ) : (
              'Tạo user mới'
            )}
          </button>

          {status && (
            <div
              className="card result-card"
              style={{
                marginTop: '1rem',
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

              {status.type === 'success' && status.details && (
                <ul style={{ margin: '0.75rem 0 0 0', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <li>ID: {status.details.id}</li>
                  <li>Username: {status.details.username}</li>
                  <li>Thuật toán: {status.details.algorithm}</li>
                  <li>Thời gian tạo: {new Date(status.details.createdAt).toLocaleString('vi-VN')}</li>
                </ul>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default CreateUserPage;


