import React, { useState } from 'react';

const defaultForm = {
  userId: '',
  attackType: 'dictionary',
  wordlistId: 'small',
  wordlistId2: 'small',
  maxLength: 4,
  charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
  hybridSuffixLength: 2,
  hybridSuffixCharset: '0123456789',
  maskPattern: '?l?l?d?d',
  ruleTypes: ['lowercase', 'uppercase'],
};

const CrackForm = ({ users = [], wordlists = [], onSubmit, loading }) => {
  const [form, setForm] = useState(defaultForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.userId) return;
    onSubmit(form);
  };

  return (
    <form className="card" onSubmit={handleSubmit} style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        Cấu hình tấn công
      </h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            Chọn user
          </span>
          <select name="userId" value={form.userId} onChange={handleChange} required>
            <option value="">-- Chọn user để tấn công --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.algorithm})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            Kiểu tấn công
          </span>
          <select name="attackType" value={form.attackType} onChange={handleChange}>
            <option value="dictionary">Dictionary Attack</option>
            <option value="bruteforce">Brute-force Attack (demo)</option>
            <option value="hybrid">Hybrid Attack (Dictionary + Brute-force)</option>
            <option value="mask">Mask Attack (Pattern-based)</option>
            <option value="rule">Rule-based Attack (Dictionary + Rules)</option>
            <option value="combinator">Combinator Attack (Wordlist + Wordlist)</option>
            <option value="togglecase">Toggle Case Attack (All case variations)</option>
          </select>
        </label>
      </div>

      {form.attackType === 'dictionary' || form.attackType === 'rule' || form.attackType === 'togglecase' ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Wordlist
            </span>
            <select name="wordlistId" value={form.wordlistId} onChange={handleChange}>
              {wordlists.map((wordlist) => (
                <option key={wordlist.id} value={wordlist.id}>
                  {wordlist.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : form.attackType === 'combinator' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Wordlist 1
            </span>
            <select name="wordlistId" value={form.wordlistId} onChange={handleChange}>
              {wordlists.map((wordlist) => (
                <option key={wordlist.id} value={wordlist.id}>
                  {wordlist.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Wordlist 2
            </span>
            <select name="wordlistId2" value={form.wordlistId2} onChange={handleChange}>
              {wordlists.map((wordlist) => (
                <option key={wordlist.id} value={wordlist.id}>
                  {wordlist.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : form.attackType === 'bruteforce' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Độ dài tối đa
            </span>
            <input
              type="number"
              min={1}
              max={5}
              name="maxLength"
              value={form.maxLength}
              onChange={handleChange}
              placeholder="4"
            />
          </label>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Ký tự cho phép
            </span>
            <input
              name="charset"
              value={form.charset}
              onChange={handleChange}
              placeholder="a-z0-9"
            />
          </label>
        </div>
      ) : form.attackType === 'hybrid' ? (
        <>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Wordlist
              </span>
              <select name="wordlistId" value={form.wordlistId} onChange={handleChange}>
                {wordlists.map((wordlist) => (
                  <option key={wordlist.id} value={wordlist.id}>
                    {wordlist.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Độ dài suffix
              </span>
              <input
                type="number"
                min={1}
                max={3}
                name="hybridSuffixLength"
                value={form.hybridSuffixLength}
                onChange={handleChange}
                placeholder="2"
              />
            </label>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                Ký tự suffix
              </span>
              <input
                name="hybridSuffixCharset"
                value={form.hybridSuffixCharset}
                onChange={handleChange}
                placeholder="0123456789"
              />
            </label>
          </div>
        </>
      ) : form.attackType === 'mask' ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Pattern (Ví dụ: ?l?l?d?d = 2 chữ cái + 2 số)
            </span>
            <input
              name="maskPattern"
              value={form.maskPattern}
              onChange={handleChange}
              placeholder="?l?l?d?d"
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              ?l = chữ cái thường, ?u = chữ cái hoa, ?d = số, ?s = ký tự đặc biệt
            </p>
          </label>
        </div>
      ) : null}

      {form.attackType === 'rule' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Rules (Áp dụng cho từ điển)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['lowercase', 'uppercase', 'capitalize', 'addNumbers', 'addSymbols'].map((rule) => (
                <label key={rule} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.ruleTypes?.includes(rule) || false}
                    onChange={(e) => {
                      const newRules = e.target.checked
                        ? [...(form.ruleTypes || []), rule]
                        : (form.ruleTypes || []).filter((r) => r !== rule);
                      setForm((prev) => ({ ...prev, ruleTypes: newRules }));
                    }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>
                    {rule === 'lowercase' && 'lowercase'}
                    {rule === 'uppercase' && 'UPPERCASE'}
                    {rule === 'capitalize' && 'Capitalize'}
                    {rule === 'addNumbers' && '+Numbers'}
                    {rule === 'addSymbols' && '+Symbols'}
                  </span>
                </label>
              ))}
            </div>
          </label>
        </div>
      )}

      <button type="submit" disabled={loading || !form.userId} style={{ width: '100%' }}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span className="loading"></span>
            Đang tạo job...
          </span>
        ) : (
          'Tạo job crack →'
        )}
      </button>
    </form>
  );
};

export default CrackForm;


