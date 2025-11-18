import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '../lib/api'

export default function Storefront({ slug }){
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function load(){
    try {
      const data = await apiGet(`/s/${slug}/products`)
      setProducts(data)
    } catch (e) { console.error(e) }
  }
  useEffect(()=>{ load() },[slug])

  function addToCart(p){
    setCart(prev => {
      const existing = prev.find(i => i.product_id === p._id)
      if (existing) return prev.map(i => i.product_id === p._id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product_id: p._id, title: p.title, price: p.price, quantity: 1 }]
    })
  }

  async function checkout(){
    setLoading(true)
    setMessage('')
    try {
      const res = await apiPost(`/s/${slug}/checkout`, {
        name, email,
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        simulate_payment: true
      })
      setMessage(`Payment successful. Order ${res.order_id} · Total $${res.total}`)
      setCart([])
    } catch (e) {
      setMessage('Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p._id} className="bg-white rounded-xl shadow p-3 flex flex-col">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-40 w-full object-cover rounded"/>}
                <div className="flex-1">
                  <p className="font-medium mt-2">{p.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold">${p.price}</span>
                  <button onClick={()=>addToCart(p)} className="px-3 py-1 bg-blue-600 text-white rounded">Add</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-medium mb-2">Cart</h3>
          <ul className="divide-y mb-3">
            {cart.map(i => (
              <li key={i.product_id} className="py-2 flex items-center justify-between">
                <span>{i.title} × {i.quantity}</span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
            {cart.length === 0 && <p className="text-sm text-gray-500">No items</p>}
          </ul>
          <div className="space-y-2">
            <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2"/>
            <button disabled={loading || cart.length===0} onClick={checkout} className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-60">{loading?'Processing…':'Checkout'}</button>
            {message && <p className="text-sm text-gray-700">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
