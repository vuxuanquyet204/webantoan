import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canSubmit = useMemo(() => form.username.trim() && form.password.trim(), [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await loginUser(form);
      setResult(data);

      if (data.success) {
        onLogin?.({ username: data.username, algorithm: data.algorithm });
        navigate('/', { replace: true });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Đăng nhập thất bại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Đăng nhập</h2>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Xác thực mật khẩu với các thuật toán hash khác nhau
        </p>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <form className="card" onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Username
              </span>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nhập tên người dùng"
                required
                style={{ width: '100%' }}
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
                placeholder="Nhập mật khẩu"
                required
                style={{ width: '100%' }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !canSubmit}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="loading"></span>
                Đang kiểm tra...
              </span>
            ) : (
              'Đăng nhập →'
            )}
          </button>
        </form>

        {result && (
          <div
            className="card result-card"
            style={{
              marginTop: '1.5rem',
              background: result.success
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              borderColor: result.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Kết quả xác thực
            </h4>
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Thuật toán:</strong> <span className="mono">{result.algorithm}</span>
              </p>
              <p
                className={result.success ? 'text-success' : 'text-error'}
                style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}
              >
                {result.success ? '✓ Xác thực thành công!' : result.message || '✗ Sai mật khẩu'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LoginPage;


