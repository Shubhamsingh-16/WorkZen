import { NavLink } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { LayoutDashboard, CheckSquare, FolderKanban, Activity, Users, BarChart3, Kanban, LogOut, Zap, ChevronRight } from 'lucide-react';

const memberLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/tasks',     icon: CheckSquare,     label: 'My Tasks'    },
  { to: '/kanban',    icon: Kanban,          label: 'Kanban'      },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'    },
  { to: '/activity',  icon: Activity,        label: 'Activity'    },
];

const adminLinks = [
  { to: '/dashboard',     icon: BarChart3,    label: 'Overview'   },
  { to: '/admin/members', icon: Users,        label: 'Members'    },
  { to: '/tasks',         icon: CheckSquare,  label: 'All Tasks'  },
  { to: '/kanban',        icon: Kanban,       label: 'Kanban'     },
  { to: '/projects',      icon: FolderKanban, label: 'Projects'   },
  { to: '/activity',      icon: Activity,     label: 'Activity'   },
];

export function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const links = isAdmin ? adminLinks : memberLinks;
  const initials = user?.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside style={{
      width: 224,
      flexShrink: 0,
      height: '100vh',
      background: 'var(--nav-bg)',
      borderRight: '1px solid var(--nav-border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'background 0.3s',
      position: 'relative',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--nav-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: 'linear-gradient(135deg, #818cf8, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.5)',
        }}>
          <Zap size={15} color="#fff" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>WorkZen</div>
          {isAdmin && <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>Admin</div>}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="section-title" style={{ color: 'rgba(255,255,255,0.2)', padding: '0 8px', marginBottom: 6, marginTop: 4 }}>
          {isAdmin ? 'Admin' : 'Menu'}
        </div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={15} style={{ flexShrink: 0, opacity: 0.85 }} />
            <span style={{ flex: 1 }}>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--nav-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, marginBottom: 2 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(129,140,248,0.4), rgba(99,102,241,0.3))',
            border: '1.5px solid rgba(129,140,248,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#a5b4fc', fontSize: '0.7rem', fontWeight: 700,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="truncate" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{user?.name}</div>
            <div className="truncate" style={{ fontSize: '0.7rem', color: 'rgba(165,180,252,0.5)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="nav-link" style={{ width: '100%', color: 'rgba(248,113,113,0.6)', fontSize: '0.8125rem' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(248,113,113,0.6)'; }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
