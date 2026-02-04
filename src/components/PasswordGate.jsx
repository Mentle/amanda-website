import { useState, useEffect } from 'react'
import './PasswordGate.css'

function PasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Check if already authenticated in session
  useEffect(() => {
    const auth = sessionStorage.getItem('siteAuthenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple password check - you can change this password
    if (password === 'Cuba2020!') {
      setIsAuthenticated(true)
      sessionStorage.setItem('siteAuthenticated', 'true')
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return children
  }

  return (
    <div className="password-gate">
      <div className="password-gate-content">
        <div className="construction-icon">🚧</div>
        <h1>Under Construction</h1>
        <p>This site is currently being updated.</p>
        <p className="access-text">Have access? Enter password below:</p>
        
        <form onSubmit={handleSubmit} className="password-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="password-input"
            autoFocus
          />
          <button type="submit" className="password-submit">
            Enter Site
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default PasswordGate
