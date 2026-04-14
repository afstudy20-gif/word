import { useState } from 'react'
import { login, register } from '../lib/api'
import './AuthPage.css'

interface AuthPageProps {
  onAuth: (username: string) => void
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const fn = isRegister ? register : login
      const result = await fn(username, password)
      onAuth(result.username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <p className="eyebrow">Context Deck</p>
          <h1>Kelime Laboratuvarı</h1>
          <p className="auth-subtitle">SRS tabanlı İngilizce kelime öğrenme platformu</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-tabs">
            <button
              type="button"
              className={!isRegister ? 'is-active' : ''}
              onClick={() => { setIsRegister(false); setError(null) }}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              className={isRegister ? 'is-active' : ''}
              onClick={() => { setIsRegister(true); setError(null) }}
            >
              Kayıt Ol
            </button>
          </div>

          <label className="auth-field">
            <span>Kullanıcı Adı</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="kullanici_adi"
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
            />
          </label>

          <label className="auth-field">
            <span>Şifre</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Lütfen bekleyin...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
