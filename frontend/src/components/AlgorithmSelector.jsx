import React from 'react';

const algorithmFields = {
  bcrypt: [
    { name: 'rounds', label: 'Cost factor (rounds)', type: 'number', min: 4, max: 15 },
  ],
  argon2id: [
    { name: 'memoryCost', label: 'Memory cost (KB)', type: 'number', min: 1024, step: 1024 },
    { name: 'timeCost', label: 'Time cost (iterations)', type: 'number', min: 1 },
    { name: 'parallelism', label: 'Parallelism', type: 'number', min: 1 },
  ],
  md5: [
    { name: 'useSalt', label: 'Use salt (demo)', type: 'checkbox' },
  ],
  sha1: [
    { name: 'useSalt', label: 'Use salt (demo)', type: 'checkbox' },
  ],
};

const AlgorithmSelector = ({ algorithm, params, onAlgorithmChange, onParamsChange }) => {
  const handleAlgorithmChange = (event) => {
    onAlgorithmChange(event.target.value);
  };

  const handleParamChange = (event, field) => {
    if (field.type === 'checkbox') {
      onParamsChange({ ...params, [field.name]: event.target.checked });
    } else {
      onParamsChange({ ...params, [field.name]: event.target.value });
    }
  };

  const fields = algorithmFields[algorithm] || [];

  const algorithmInfo = {
    bcrypt: { desc: 'An toàn - Khuyến nghị sử dụng', color: 'var(--success)' },
    argon2id: { desc: 'Rất an toàn - Thuật toán hiện đại nhất', color: 'var(--success)' },
    md5: { desc: 'Không an toàn - Chỉ để demo', color: 'var(--danger)' },
    sha1: { desc: 'Không an toàn - Chỉ để demo', color: 'var(--danger)' },
  };

  const info = algorithmInfo[algorithm] || { desc: '', color: 'var(--text-muted)' };

  return (
    <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="algorithm" style={{ marginBottom: '0.5rem', display: 'block' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Thuật toán hash
          </span>
        </label>
        <select
          id="algorithm"
          value={algorithm}
          onChange={handleAlgorithmChange}
          style={{ width: '100%' }}
        >
          <option value="bcrypt">bcrypt (An toàn)</option>
          <option value="argon2id">argon2id (Rất an toàn)</option>
          <option value="md5">MD5 (Không an toàn - Demo)</option>
          <option value="sha1">SHA1 (Không an toàn - Demo)</option>
        </select>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: info.color, fontWeight: 500 }}>
          {info.desc}
        </p>
      </div>

      {fields.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
            Tham số cấu hình
          </h4>
          <div className="params-grid">
            {fields.map((field) => (
              <label key={field.name} className="param-field">
                <span style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 500 }}>
                  {field.label}
                </span>
                {field.type === 'checkbox' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(params[field.name])}
                      onChange={(event) => handleParamChange(event, field)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {params[field.name] ? 'Bật' : 'Tắt'}
                    </span>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    value={params[field.name] ?? ''}
                    onChange={(event) => handleParamChange(event, field)}
                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelector;


