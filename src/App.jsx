import { useEffect, useState } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import StoreAdmin from './components/StoreAdmin'
import Storefront from './components/Storefront'

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('auth_token'))
  const [route, setRoute] = useState(window.location.pathname)
  const [activeStore, setActiveStore] = useState(null)

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function navigate(path){
    window.history.pushState({}, '', path)
    setRoute(path)
  }

  // Simple routes:
  // /           -> landing/auth or dashboard
  // /admin      -> store admin (after selecting a store on dashboard)
  // /store/:slug -> storefront

  if (route.startsWith('/store/')) {
    const slug = route.replace('/store/','')
    return (
      <Page>
        <Header onNav={navigate} />
        <Storefront slug={slug} />
      </Page>
    )
  }

  if (!authed) {
    return (
      <Page>
        <Header onNav={navigate} />
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="flex items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Build and run your online store</h1>
              <p className="text-gray-600 mb-6">Create products, manage customers and orders, and share a beautiful storefront.
              </p>
            </div>
          </div>
          <Auth onAuth={() => setAuthed(true)} />
        </div>
      </Page>
    )
  }

  if (route === '/admin' && activeStore) {
    return (
      <Page>
        <Header onNav={navigate} />
        <StoreAdmin storeId={activeStore} />
      </Page>
    )
  }

  return (
    <Page>
      <Header onNav={navigate} />
      <Dashboard />
      <div className="mt-6 text-center text-sm text-gray-500">Pick a store on the left, then copy its ID from the URL bar after you click into it to manage. Or use the built-in controls to open its storefront.</div>
    </Page>
  )
}

function Page({ children }){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {children}
      </div>
    </div>
  )
}

function Header({ onNav }){
  return (
    <div className="flex items-center justify-between py-2">
      <a href="/" onClick={(e)=>{e.preventDefault(); onNav('/') }} className="font-semibold">ShopFlow</a>
      <nav className="flex items-center gap-4 text-sm">
        <a href="#" onClick={(e)=>{e.preventDefault(); onNav('/') }} className="text-gray-600 hover:text-gray-900">Dashboard</a>
        <a href="#" onClick={(e)=>{e.preventDefault(); onNav('/admin') }} className="text-gray-600 hover:text-gray-900">Admin</a>
        <a href="/test" className="text-gray-600 hover:text-gray-900">Connection</a>
      </nav>
    </div>
  )
}

export default App
