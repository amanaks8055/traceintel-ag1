import { useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom'
import { api, errMsg, getAuth, setAuth } from './api'
import { can, PAGES } from './config'
import Page from './Page'
import './index.css'

function Login({ onAuth }) {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (username.trim().length < 3 || password.length < 6) {
      setError('Enter a username (3+ characters) and a password (6+ characters).')
      return
    }
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post('/api/auth/login', { username: username.trim(), password })
      const auth = { token: data.token, role: data.role, fullName: data.fullName }
      setAuth(auth)
      onAuth(auth)
      nav('/dashboard')
    } catch (requestError) {
      setError(requestError.response?.status === 401 ? 'Wrong username or password.' : errMsg(requestError))
    } finally {
      setBusy(false)
    }
  }
  return <div className="login">
    <form className="card login-card" onSubmit={submit}><div className="brand"><i className="mk" />TraceIntel AG-1</div>
      <h1>Sign in</h1><p className="mute">Track every part from supplier to vehicle.</p>
      <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
      <label>Password<span className="pw"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" className="btn sm" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></span></label>
      {error && <div className="alert bad" role="alert">{error}</div>}
      <button className="btn pri" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
    </form>
  </div>
}

function Shell({ auth, out, page }) {
  const location = useLocation()
  const groups = useMemo(() => [...new Set(PAGES.filter((item) => can(item, auth.role)).map((item) => item.g))], [auth.role])
  return <div className="shell"><aside className="sidebar">
    <Link to="/dashboard" className="brand"><i className="mk" />TraceIntel AG-1</Link>
    <nav className="side-nav" aria-label="Main navigation">{groups.map((group) => <div className="nav-group" key={group}><span>{group}</span>
      {PAGES.filter((item) => item.g === group && can(item, auth.role)).map((item) => <Link className={location.pathname === item.path ? 'nav-link active' : 'nav-link'} key={item.id} to={item.path}>{item.title}</Link>)}
    </div>)}</nav>
    <div className="side-user"><strong>{auth.fullName}</strong><small>{auth.role}</small><button className="btn" onClick={out}>Sign out</button></div>
  </aside><div className="content"><header className="top"><div><span className="crumb">TraceIntel / {page.g}</span><h1>{page.title}</h1></div><span className="mobile-user">{auth.fullName}</span></header>
    <main>{can(page, auth.role) ? <Page cfg={page} role={auth.role} /> : <div className="card"><h2>You do not have access</h2><p>Your role ({auth.role}) cannot open {page.title}.</p></div>}</main>
  </div></div>
}

export default function App() {
  const [auth, setA] = useState(getAuth())
  const out = () => { setAuth(null); setA(null) }
  return <BrowserRouter><Routes><Route path="/login" element={auth ? <Navigate to="/dashboard" /> : <Login onAuth={setA} />} />{PAGES.map((page) => <Route key={page.id} path={page.path} element={auth ? <Shell auth={auth} out={out} page={page} /> : <Navigate to="/login" />} />)}<Route path="*" element={<Navigate to="/dashboard" />} /></Routes></BrowserRouter>
}
