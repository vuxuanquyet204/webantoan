import React, { useCallback, useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserList from './pages/UserList';
import CrackDemoPage from './pages/CrackDemoPage';
import BenchmarkResults from './pages/BenchmarkResults';
import HomePage from './pages/HomePage';
import CreateUserPage from './pages/CreateUserPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const App = () => {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = useCallback((payload) => {
    localStorage.setItem('authUser', JSON.stringify(payload));
    setUser(payload);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authUser');
    setUser(null);
  }, []);

  const isAuthRoute = useMemo(() => ['/login', '/register'].includes(location.pathname), [location.pathname]);

  return (
    <div className="layout">
      <header>
        <div>
          <h1>🔬 Secure Password Storage Lab</h1>
          <p className="muted" style={{ fontSize: '0.95rem' }}>
            Phòng thí nghiệm so sánh bcrypt / argon2id vs MD5 / SHA1 + cracking benchmark
          </p>
        </div>
        <nav>
          {user ? (
            <>
              <NavLink to="/" end>
                Trang chủ
              </NavLink>
              <NavLink to="/users">Bảng hash</NavLink>
              <NavLink to="/crack">Tấn công</NavLink>
              <NavLink to="/stats">Biểu đồ</NavLink>
              <button type="button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : undefined)}>
                Đăng ký
              </NavLink>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <HomePage user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/users"
            element={(
              <ProtectedRoute user={user}>
                <UserList />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/users/new"
            element={(
              <ProtectedRoute user={user}>
                <CreateUserPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/crack"
            element={(
              <ProtectedRoute user={user}>
                <CrackDemoPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/stats"
            element={(
              <ProtectedRoute user={user}>
                <BenchmarkResults />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </main>
      <footer>
        <small>
          Worker threads + PostgreSQL benchmark •{' '}
          <a href="https://argon2-cffi.readthedocs.io/" target="_blank" rel="noreferrer">
            Learn more
          </a>
        </small>
      </footer>
    </div>
  );
};

export default App;
