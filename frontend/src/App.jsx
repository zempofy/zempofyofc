import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PreferenciasProvider } from './contexts/PreferenciasContext'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardFuncionario from './pages/DashboardFuncionario'

// Gestor = admin ou administrador → vai pro painel admin
const isGestor = (cargo) => ['admin', 'administrador'].includes(cargo)

function RotaProtegida({ children, apenasGestor, apenasColaborador }) {
  const { usuario, carregando } = useAuth()

  if (carregando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#22C55E', fontFamily: 'Inter, sans-serif', fontSize: '1.2rem' }}>
      Carregando...
    </div>
  )

  if (!usuario) return <Navigate to="/login" replace />

  if (apenasGestor && !isGestor(usuario.cargo)) {
    return <Navigate to="/dashboard" replace />
  }

  if (apenasColaborador && isGestor(usuario.cargo)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

function RedirecionarLogado() {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return <Navigate to={isGestor(usuario.cargo) ? '/admin' : '/dashboard'} replace />
}

export default function App() {
  return (
    <PreferenciasProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RedirecionarLogado />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/admin/*" element={
                <RotaProtegida apenasGestor>
                  <DashboardAdmin />
                </RotaProtegida>
              } />
              <Route path="/dashboard/*" element={
                <RotaProtegida apenasColaborador>
                  <DashboardFuncionario />
                </RotaProtegida>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </PreferenciasProvider>
  )
}
