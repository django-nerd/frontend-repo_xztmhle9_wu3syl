import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPatch, apiDelete } from '../lib/api'

export default function StoreAdmin({ storeId }) {
  const [tab, setTab] = useState('products')

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center gap-2 mb 4">
        <button className={`px-3 py-1 rounded ${tab==='products'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('products')}>Products</button>
        <button className={`px-3 py-1 rounded ${tab==='customers'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('customers')}>Customers</button>
        <button className={`px-3 py-1 rounded ${tab==='orders'?'bg-blue-600 text-white':'bg-gray-100'}`} onClick={()=>setTab('orders')}>Orders</button>
      </div>
      {tab === 'products' && <Products storeId={storeId} />}
      {tab === 'customers' && <Customers storeId={storeId} />}
      {tab === 'orders' && <Orders storeId={storeId} />}
    </div>
  )
}

function Products({ storeId }){
  const [list, setList] = useState([])
  const [form, setForm] = useState({ title:'', description:'', price:0, stock:0, category:'', images:'' })
  const [loading, setLoading] = useState(false)

  async function load(){
    const data = await apiGet(`/stores/${storeId}/products`)
    setList(data)
  }
  useEffect(()=>{ load() },[storeId])

  async function create(e){
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), images: form.images? form.images.split(',').map(s=>s.trim()):[] }
    await apiPost(`/stores/${storeId}/products`, payload)
    setForm({ title:'', description:'', price:0, stock:0, category:'', images:'' })
    await load()
    setLoading(false)
  }

  async function remove(id){
    if (!confirm('Delete product?')) return
    await apiDelete(`/products/${id}`)
    await load()
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ul className="divide-y">
          {list.map(p => (
            <li key={p._id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">${p.price} • Stock {p.stock}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`#/product/${p._id}`} className="text-sm text-blue-600">Edit</a>
                <button onClick={()=>remove(p._id)} className="text-sm text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium mb-2">Add product</h4>
        <form onSubmit={create} className="space-y-2">
          {['title','description','price','stock','category','images'].map(key => (
            <div key={key}>
              <label className="block text-xs text-gray-600 capitalize">{key}</label>
              <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full border rounded px-2 py-1"/>
            </div>
          ))}
          <button disabled={loading} className="w-full bg-blue-600 text-white rounded py-2">{loading?'Saving…':'Create'}</button>
        </form>
      </div>
    </div>
  )
}

function Customers({ storeId }){
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name:'', email:'', tags:'' })

  async function load(){
    const data = await apiGet(`/stores/${storeId}/customers`)
    setList(data)
  }
  useEffect(()=>{ load() },[storeId])

  async function create(e){
    e.preventDefault()
    const payload = { ...form, tags: form.tags? form.tags.split(',').map(s=>s.trim()):[] }
    await apiPost(`/stores/${storeId}/customers`, payload)
    setForm({ name:'', email:'', tags:'' })
    await load()
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ul className="divide-y">
          {list.map(c => (
            <li key={c._id} className="py-3">
              <p className="font-medium">{c.name} <span className="text-gray-500">({c.email})</span></p>
              {c.tags?.length>0 && <p className="text-xs text-gray-500">Tags: {c.tags.join(', ')}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium mb-2">Add customer</h4>
        <form onSubmit={create} className="space-y-2">
          {['name','email','tags'].map(key => (
            <div key={key}>
              <label className="block text-xs text-gray-600 capitalize">{key}</label>
              <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full border rounded px-2 py-1"/>
            </div>
          ))}
          <button className="w-full bg-blue-600 text-white rounded py-2">Create</button>
        </form>
      </div>
    </div>
  )
}

function Orders({ storeId }){
  const [list, setList] = useState([])
  const [status, setStatus] = useState('')

  async function load(){
    const qs = status? `?status=${status}`:''
    const data = await apiGet(`/stores/${storeId}/orders${qs}`)
    setList(data)
  }
  useEffect(()=>{ load() },[storeId, status])

  async function updateStatus(id, next){
    await apiPatch(`/orders/${id}/status`, { status: next })
    await load()
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm">Filter status</label>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          {['pending','paid','fulfilled','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <ul className="divide-y">
        {list.map(o => (
          <li key={o._id} className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Order #{o._id.slice(-6)} · ${o.total}</p>
                <p className="text-xs text-gray-500">{o.items?.length || 0} items · {o.status}</p>
              </div>
              <div className="flex items-center gap-2">
                {['pending','paid','fulfilled','cancelled'].map(s => (
                  <button key={s} onClick={()=>updateStatus(o._id, s)} className={`px-2 py-1 rounded text-xs border ${o.status===s?'bg-gray-900 text-white':'bg-white'}`}>{s}</button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
