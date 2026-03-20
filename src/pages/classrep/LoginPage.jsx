import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button, Input, Alert } from '../../components/ui'
import { Mail, Lock } from 'lucide-react'
import '../../components/ui/components.css'
import './auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      if (data.success) navigate('/')
      else setError(data.message || 'Login failed. Please try again.')
    } catch (err) {
      const msg = err?.response?.data?.message
      if (msg) {
        setError(msg)
      } else if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        setError('Unable to reach the server. Please check your internet connection.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <div className="logo-mark" style={{ width:48, height:48, fontSize:'1.1rem' }}>CQ</div>
          <h1 className="auth-title">ClassIQ</h1>
          <p className="auth-sub">Class Representative Portal</p>
        </div>

        {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}

        <form onSubmit={submit} className="auth-form">
          <Input
            label="Email Address" id="email" name="email" type="email"
            value={form.email} onChange={handle}
            placeholder="you@example.com"
            icon={<Mail size={16}/>} required
          />
          <Input
            label="Password" id="password" name="password" type="password"
            value={form.password} onChange={handle}
            placeholder="••••••••"
            icon={<Lock size={16}/>} required
          />
          <Button type="submit" fullWidth loading={loading} size="lg">
            Sign In
          </Button>
        </form>

        <p className="auth-foot">
          Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  )
}
