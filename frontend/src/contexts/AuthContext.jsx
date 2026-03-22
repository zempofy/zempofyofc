import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('zempofy_token')
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`
      api.get('/auth/me')
        .then(res => setUsuario(res.data))
        .catch(() => localStorage.removeItem('zempofy_token'))
        .finally(() => setCarregando(false))
    } else {
      setCarregando(false)
    }
  }, [])

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha })
    const { token, usuario } = res.data
    localStorage.setItem('zempofy_token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUsuario(usuario)
    return usuario
  }

  const cadastrar = async (dados) => {
    const res = await api.post('/auth/cadastro', dados)
    const { token, usuario } = res.data
    localStorage.setItem('zempofy_token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
    setUsuario(usuario)
    return usuario
  }

  const recarregarUsuario = async () => {
    try {
      const res = await api.get('/auth/me')
      setUsuario(res.data)
    } catch (err) { console.error(err) }
  }

  const sair = () => {
    localStorage.removeItem('zempofy_token')
    delete api.defaults.headers.Authorization
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, cadastrar, sair, recarregarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
