import { useState } from 'react'
import { Factory, LockKeyhole, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await signIn(username.trim(), password)
      navigate('/dashboard')
    } catch {
      setError('Sign-in failed. Check your credentials and API connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <span className="brand-mark"><Factory size={18} /></span>
        <h1>TraceIntel AG-1</h1>
        <p>Manufacturing traceability control center</p>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <UserRound size={16} />
              <input id="username" value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <LockKeyhole size={16} />
              <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
