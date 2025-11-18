import React, { useEffect, useState } from 'react';
import CrackForm from '../components/CrackForm';
import CrackResultTable from '../components/CrackResultTable';
import {
  fetchUsers,
  fetchWordlists,
  createCrackJob,
  fetchCrackJobs,
  cancelCrackJob,
  deleteCrackJob,
  deleteAllCrackJobs,
} from '../services/api';

const CrackDemoPage = () => {
  const [users, setUsers] = useState([]);
  const [wordlists, setWordlists] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingJobs, setCancellingJobs] = useState([]);
  const [deletingJobs, setDeletingJobs] = useState([]);
  const [deletingAll, setDeletingAll] = useState(false);
  const [status, setStatus] = useState(null);

  const loadUsers = async () => {
    const { data } = await fetchUsers();
    setUsers(data);
  };

  const loadWordlists = async () => {
    const { data } = await fetchWordlists();
    setWordlists(data);
  };

  const loadJobs = async () => {
    const { data } = await fetchCrackJobs();
    setJobs(data);
  };

  useEffect(() => {
    loadUsers();
    loadWordlists();
    loadJobs();
    const interval = setInterval(loadJobs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateJob = async (form) => {
    setCreating(true);
    setError(null);
    try {
      const jobData = {
        userId: Number(form.userId),
        attackType: form.attackType,
        wordlistId: form.wordlistId,
        maxLength: Number(form.maxLength),
        charset: form.charset,
      };

      // Add hybrid attack params
      if (form.attackType === 'hybrid') {
        jobData.hybridSuffixLength = Number(form.hybridSuffixLength);
        jobData.hybridSuffixCharset = form.hybridSuffixCharset;
      }

      // Add mask attack params
      if (form.attackType === 'mask') {
        jobData.maskPattern = form.maskPattern;
      }

      // Add rule-based attack params
      if (form.attackType === 'rule') {
        jobData.ruleTypes = form.ruleTypes || [];
      }

      // Add combinator attack params
      if (form.attackType === 'combinator') {
        jobData.wordlistId2 = form.wordlistId2;
      }

      await createCrackJob(jobData);
      await loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo job');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelJob = async (jobId) => {
    setCancellingJobs((prev) => [...prev, jobId]);
    setError(null);
    try {
      await cancelCrackJob(jobId);
      await loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể dừng job');
    } finally {
      setCancellingJobs((prev) => prev.filter((id) => id !== jobId));
    }
  };

  const handleDeleteJob = async (jobId) => {
    setDeletingJobs((prev) => [...prev, jobId]);
    setError(null);
    setStatus(null);
    try {
      await deleteCrackJob(jobId);
      setStatus({
        type: 'success',
        message: 'Đã xóa job thành công!',
      });
      await loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa job');
    } finally {
      setDeletingJobs((prev) => prev.filter((id) => id !== jobId));
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleDeleteAllJobs = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa TẤT CẢ ${jobs.length} jobs? Hành động này không thể hoàn tác và sẽ dừng tất cả jobs đang chạy.`)) {
      return;
    }

    setDeletingAll(true);
    setError(null);
    setStatus(null);
    try {
      const { data } = await deleteAllCrackJobs();
      setStatus({
        type: 'success',
        message: `Đã xóa thành công ${data.deletedCount} job(s)!`,
      });
      await loadJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa tất cả jobs');
    } finally {
      setDeletingAll(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <section className="page">
      <div style={{ marginBottom: '2rem' }}>
        <h2>Tấn công crack hash</h2>
        <p style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>
          Cấu hình worker threads để benchmark dictionary và brute-force attacks
        </p>
      </div>

      <CrackForm
        users={users}
        wordlists={wordlists}
        onSubmit={handleCreateJob}
        loading={creating}
      />

      {error && (
        <div
          className="card result-card"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            marginTop: '1rem',
          }}
        >
          <p className="text-error" style={{ margin: 0, fontWeight: 600 }}>
            {error}
          </p>
        </div>
      )}

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
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>Kết quả gần nhất</h3>
          {jobs.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllJobs}
              disabled={deletingAll}
              style={{
                background: deletingAll ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                cursor: deletingAll ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                opacity: deletingAll ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (!deletingAll) {
                  e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!deletingAll) {
                  e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }
              }}
            >
              {deletingAll ? (
                <>
                  <span className="loading" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></span>
                  Đang xóa...
                </>
              ) : (
                <>
                  Làm sạch tất cả ({jobs.length})
                </>
              )}
            </button>
          )}
        </div>
        <CrackResultTable
          jobs={jobs}
          onCancel={handleCancelJob}
          cancellingJobs={cancellingJobs}
          onDelete={handleDeleteJob}
          deletingJobs={deletingJobs}
        />
      </div>
    </section>
  );
};

export default CrackDemoPage;


