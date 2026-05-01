import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Zap, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const DEMO = [
  { label: 'Admin',   emoji: '⚡', email: 'admin@taskmanager.com',   password: 'Admin@123',  role: 'Full Access',  color: '#818cf8' },
  { label: 'Alice',   emoji: '🎨', email: 'alice@taskmanager.com',   password: 'Member@123', role: 'Designer',     color: '#34d399' },
  { label: 'Bob',     emoji: '💻', email: 'bob@taskmanager.com',     password: 'Member@123', role: 'Developer',    color: '#60a5fa' },
  { label: 'Charlie', emoji: '🚀', email: 'charlie@taskmanager.com', password: 'Member@123', role: 'DevOps',       color: '#fbbf24' },
];

export default function Login() {
  const { login, signup, loading, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]       = useState('login');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });

  if (user) return <Navigate to="/dashboard" replace />;

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signup') {
        if (!form.name.trim()) return setError('Please enter your full name.');
        if (form.password.length < 6) return setError('Password must be at least 6 characters.');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        await signup(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || (mode === 'login' ? 'Invalid email or password.' : 'Signup failed. Try a different email.'));
    }
  };

  const fill = (u) => { setForm(f => ({ ...f, email: u.email, password: u.password })); setMode('login'); setError(''); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '30%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }} className="animate-slide-up">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 32px rgba(99,102,241,0.45)' }}>
              <Zap size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ position: 'absolute', inset: -8, borderRadius: 24, background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 6 }}>WorkZen</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9375rem' }}>
            {mode === 'login' ? 'Welcome back — let\'s get things done 💪' : 'Join your team and start building ✨'}
          </p>
        </div>

        {/* Glass card */}
        <div className="card-glass" style={{ padding: '2rem' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--raised)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[{ id: 'login', label: '🔑 Sign In' }, { id: 'signup', label: '🚀 Sign Up' }].map(tab => (
              <button key={tab.id} onClick={() => { setMode(tab.id); setError(''); }}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  background: mode === tab.id ? 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))' : 'transparent',
                  color: mode === tab.id ? '#fff' : 'var(--text-3)',
                  boxShadow: mode === tab.id ? '0 2px 10px var(--brand-glow)' : 'none',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="animate-scale-in" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 16 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>!</div>
              <p style={{ fontSize: '0.8125rem', color: '#f87171', margin: 0, lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Ada Lovelace" value={form.name} onChange={set('name')} required />
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@company.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} className="input" placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                  value={form.password} onChange={set('password')} required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="btn-ghost"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: 4 }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" className="input" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
              </div>
            )}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', marginTop: 4, borderRadius: 10 }} disabled={loading}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {/* Demo accounts */}
          {mode === 'login' && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <p className="section-title" style={{ marginBottom: 10 }}>Try a demo account</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {DEMO.map(u => (
                  <button key={u.email} onClick={() => fill(u)} style={{
                    padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)',
                    background: 'var(--surface)', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'inherit',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = u.color; e.currentTarget.style.background = 'var(--raised)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${u.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{u.emoji}</div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)' }}>{u.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8125rem', color: 'var(--text-3)' }}>
              Already have an account?{' '}
              <button onClick={() => setMode('login')} style={{ color: 'var(--brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>
                Sign in
              </button>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem', color: 'var(--text-4)' }}>
          Protected by end-to-end encryption 🔐
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
