import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';

export function Header() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();
  const [search, setSearch] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const dropRef = useRef(null);
  const initials = user?.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U';

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = e => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header style={{
      height: 56, padding: '0 20px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      transition: 'background 0.3s, border-color 0.3s',
    }}>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search tasks… (Enter)"
          style={{
            width: '100%', padding: '7px 12px 7px 34px',
            background: 'var(--raised)', border: '1.5px solid var(--border)',
            borderRadius: 9, color: 'var(--text-1)', fontSize: '0.8125rem',
            outline: 'none', fontFamily: 'inherit',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-glow)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
        <kbd style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4,
          background: 'var(--border)', color: 'var(--text-4)', border: '1px solid var(--border)',
          fontFamily: 'inherit', fontWeight: 600,
        }}>⏎</kbd>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme toggle */}
        <button className="btn-icon" onClick={() => setDark(d => !d)} title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn-icon">
            <Bell size={15} />
          </button>
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--brand)', border: '2px solid var(--surface)',
          }} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

        {/* Profile dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button onClick={() => setDropOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px',
            background: dropOpen ? 'var(--raised)' : 'transparent',
            border: `1.5px solid ${dropOpen ? 'var(--brand-light)' : 'transparent'}`,
            borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { if (!dropOpen) e.currentTarget.style.background = 'var(--raised)'; }}
            onMouseLeave={e => { if (!dropOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-light), var(--brand-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
              boxShadow: '0 2px 6px var(--brand-glow)',
            }}>
              {initials}
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-1)', maxWidth: 100 }} className="truncate">
              {user?.name}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-3)', transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }} />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div className="card animate-scale-in" style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              minWidth: 200, padding: '6px', zIndex: 100,
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            }}>
              <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{user?.email}</div>
              </div>
              {[
                { icon: User,     label: 'Profile', action: () => {} },
                { icon: Settings, label: 'Settings', action: () => {} },
              ].map(item => (
                <button key={item.label} onClick={() => { item.action(); setDropOpen(false); }} className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, fontSize: '0.8125rem' }}>
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={logout} className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 10px', borderRadius: 8, fontSize: '0.8125rem', color: '#f87171' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
