import React, { useState } from 'react';
import AlgorithmSelector from '../components/AlgorithmSelector';
import { registerUser } from '../services/api';

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
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
      await registerUser({ ...form, algorithm, params });
      setStatus({ type: 'success', message: 'Đăng ký thành công!' });
      setForm({ username: '', email: '', password: '' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Đăng ký thất bại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Đăng ký tài khoản</h2>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Chọn thuật toán hash và tham số để quan sát sự khác biệt về hiệu năng và độ an toàn
        </p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
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
                placeholder="Tên người dùng"
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
                Password
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                required
              />
            </label>
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
                Đang xử lý...
              </span>
            ) : (
              'Đăng ký →'
            )}
          </button>

          {status && (
            <div
              className="card result-card"
              style={{
                marginTop: '1rem',
                background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: status.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
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
        </form>
      </div>
    </section>
  );
};

export default RegisterPage;


