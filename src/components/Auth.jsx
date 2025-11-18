import { useState } from 'react'
import { apiPost } from '../lib/api'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        await apiPost('/auth/register', { name, email, password })
      }
      const tokenRes = await apiPost('/auth/login', { email, password })
      localStorage.setItem('auth_token', tokenRes.access_token)
      onAuth()
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  function parseError(err) {
    try {
      const data = JSON.parse(err.message)
      return data.detail || 'Something went wrong'
    } catch {
      return err.message
    }
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white/80 backdrop-blur p-6 rounded-xl shadow">
      <div className="flex justify-between mb-4">
        <button className={`px-3 py-1 rounded ${mode==='login'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('login')}>Log in</button>
        <button className={`px-3 py-1 rounded ${mode==='signup'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setMode('signup')}>Sign up</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode==='signup' && (
          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
        )}
        <div>
          <label className="block text-sm text-gray-700">Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-60">
          {loading? 'Please wait...' : (mode==='login' ? 'Log in' : 'Create account')}
        </button>
      </form>
    </div>
  )
}
