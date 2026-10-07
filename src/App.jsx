import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Jobs from './pages/Jobs'
import Dashboard from './pages/Dashboard'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Shell() {
  return <div className="app-shell">
    <Header />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </div>
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>
}
