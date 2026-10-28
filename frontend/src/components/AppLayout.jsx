import { NavLink } from 'react-router-dom'
import { BarChart3, Boxes, ClipboardList, LogOut, ScanLine, Settings, ShieldAlert, Truck, Factory } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/scan', label: 'Scan Station', icon: ScanLine },
  { to: '/shipments', label: 'Shipments', icon: Truck },
]

const traceLinks = [
  { to: '/trace', label: 'Forward Trace', icon: Boxes },
  { to: '/trace/backward', label: 'Backward Trace', icon: Boxes },
  { to: '/holds', label: 'Hold Management', icon: ShieldAlert },
]

export function AppLayout({ children }) {
  const { user, signOut } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Factory size={17} /></span>
          <span>TraceIntel AG-1</span>
        </div>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink className="nav-link" key={to} to={to}>
            <Icon size={17} /> {label}
          </NavLink>
        ))}
        <div className="nav-label">Trace & Quality</div>
        {traceLinks.map(({ to, label, icon: Icon }) => (
          <NavLink className="nav-link" key={to} to={to}>
            <Icon size={17} /> {label}
          </NavLink>
        ))}
        <div className="nav-label">Administration</div>
        <NavLink className="nav-link" to="/admin">
          <Settings size={17} /> Admin
        </NavLink>
        <NavLink className="nav-link" to="/audit">
          <ClipboardList size={17} /> Audit Log
        </NavLink>
        <div className="sidebar-footer">
          <div className="user-meta">
            <span className="avatar">{user?.fullName?.charAt(0) || 'U'}</span>
            <div>
              <div className="user-name">{user?.fullName}</div>
              <div className="role-badge">{user?.role}</div>
            </div>
          </div>
          <button className="logout-button" onClick={signOut} type="button">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">Manufacturing traceability</h1>
          <div className="connection-status"><span className="status-dot" /> API connection pending</div>
        </header>
        {children}
      </main>
    </div>
  )
}
