import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'

export default function Dashboard() {
  const [stores, setStores] = useState([])
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('My Store')
  const [slug, setSlug] = useState('my-store')
  const [description, setDescription] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadStores() {
    try {
      const data = await apiGet('/stores')
      setStores(data)
      if (!selected && data.length) {
        setSelected(data[0])
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function createStore(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await apiPost('/stores', { name, slug, description })
      await loadStores()
      setSelected({ id: res.id, name, slug })
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  function parseError(err){
    try { return JSON.parse(err.message).detail } catch { return err.message }
  }

  useEffect(() => { loadStores() }, [])
  useEffect(() => {
    async function fetchMetrics() {
      if (!selected) return
      try {
        const data = await apiGet(`/stores/${selected.id}/metrics`)
        setMetrics(data)
      } catch {}
    }
    fetchMetrics()
  }, [selected])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Stores</h2>
        <button onClick={() => { localStorage.removeItem('auth_token'); location.reload() }} className="text-sm text-red-600">Log out</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl shadow p-4">
          <h3 className="font-medium mb-4">Stores</h3>
          {stores.length === 0 && <p className="text-sm text-gray-500">No stores yet. Create one.</p>}
          <ul className="space-y-2">
            {stores.map(s => (
              <li key={s._id || s.id}>
                <button onClick={() => setSelected({ id: s._id || s.id, name: s.name, slug: s.slug })} className={`w-full text-left px-3 py-2 rounded ${selected?.id === (s._id || s.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-sm text-gray-500">/{s.slug}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-medium mb-4">Create store</h3>
          <form onSubmit={createStore} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Slug</label>
              <input value={slug} onChange={e=>setSlug(e.target.value)} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Description</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2">{loading ? 'Please wait…' : 'Create'}</button>
          </form>
        </div>
      </div>

      {selected && (
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Dashboard · {selected.name}</h3>
            <a href={`/store/${selected.slug}`} className="text-sm text-blue-600">View storefront →</a>
          </div>
          {metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="text-sm text-gray-500">Total sales</p>
                <p className="text-2xl font-semibold">${metrics.total_sales?.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50">
                <p className="text-sm text-gray-500">Total customers</p>
                <p className="text-2xl font-semibold">{metrics.total_customers}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50">
                <p className="text-sm text-gray-500">Total orders</p>
                <p className="text-2xl font-semibold">{metrics.total_orders}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading metrics…</p>
          )}
        </div>
      )}
    </div>
  )
}
