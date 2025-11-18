import React from 'react';
import { NavLink } from 'react-router-dom';

const HomePage = ({ user }) => {
  const features = [
    {
      icon: '',
      title: 'Khởi tạo hash mẫu',
      description: 'Tạo tài khoản demo với bcrypt, argon2id hoặc MD5/SHA1 để so sánh hiệu năng và độ an toàn.',
      link: user ? '/users/new' : '/register',
      linkText: user ? 'Tạo user ngay' : 'Tạo người dùng mới',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: '',
      title: 'Quan sát hash trong DB',
      description: 'Xem toàn bộ bảng người dùng cùng thuật toán, salt, và thông số đã chọn để phân tích.',
      link: '/users',
      linkText: 'Tới bảng hash',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: '',
      title: 'Chạy tấn công brute-force',
      description: 'Khởi chạy worker threads để đo thời gian crack với các wordlist và phương pháp tấn công.',
      link: '/crack',
      linkText: 'Mô phỏng tấn công',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: '',
      title: 'Thống kê benchmark',
      description: 'Xem đồ thị thời gian hoàn thành, tốc độ crack và so sánh giữa các thuật toán.',
      link: '/stats',
      linkText: 'Xem biểu đồ',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  return (
    <section className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Chào mừng, {user?.username || 'bạn'}</h2>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Phòng thí nghiệm bảo mật mật khẩu - So sánh hiệu năng và độ an toàn của các thuật toán hash
        </p>
      </div>

      <div className="home-grid">
        {features.map((feature, index) => (
          <div key={index} className="home-card">
            <h3>
              {feature.title}
            </h3>
            <p>{feature.description}</p>
            <NavLink className="button-link" to={feature.link}>
              {feature.linkText} →
            </NavLink>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Thông tin về hệ thống</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong style={{ color: 'var(--primary)' }}>Thuật toán được hỗ trợ:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              <li>bcrypt (an toàn)</li>
              <li>argon2id (an toàn)</li>
              <li>MD5 (không an toàn)</li>
              <li>SHA1 (không an toàn)</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: 'var(--primary)' }}>Tính năng:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              <li>Worker threads cho cracking</li>
              <li>Dictionary & Brute-force attacks</li>
              <li>Benchmark và thống kê</li>
              <li>Visualization với biểu đồ</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePage;

