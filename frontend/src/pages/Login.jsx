import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const usuario = await login(form.email, form.senha)
      navigate(usuario.cargo === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={styles.pagina}>
      {/* Fundo decorativo */}
      <div style={styles.fundoDecor}>
        <div style={styles.circulo1} />
        <div style={styles.circulo2} />
        <div style={styles.grade} />
      </div>

      <div style={styles.caixa} className="fade-in">
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcone}>Z</div>
          <span style={styles.logoNome}>zempofy</span>
        </div>

        <h1 style={styles.titulo}>Bem-vindo de volta</h1>
        <p style={styles.subtitulo}>Entre na sua conta para continuar</p>

        {erro && <div style={styles.erro}>{erro}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.botao} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.rodape}>
          Não tem conta?{' '}
          <Link to="/cadastro" style={styles.link}>
            Cadastre sua empresa
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  pagina: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#080C0A',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  fundoDecor: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  circulo1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
  },
  circulo2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,107,60,0.1) 0%, transparent 70%)',
    bottom: '-80px',
    left: '-80px',
  },
  grade: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  caixa: {
    background: 'rgba(17,23,20,0.95)',
    border: '1px solid #2A3830',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logoIcone: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #22C55E, #1A6B3C)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '800',
    fontSize: '18px',
    color: '#fff',
  },
  logoNome: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    fontSize: '20px',
    color: '#E8F5EE',
    letterSpacing: '-0.5px',
  },
  titulo: {
    fontSize: '1.75rem',
    color: '#E8F5EE',
    marginBottom: '6px',
  },
  subtitulo: {
    color: '#6B8F78',
    fontSize: '0.9rem',
    marginBottom: '28px',
  },
  erro: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#FCA5A5',
    fontSize: '0.875rem',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '500',
    color: '#6B8F78',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  input: {
    background: '#1E2820',
    border: '1px solid #2A3830',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#E8F5EE',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s',
    width: '100%',
  },
  botao: {
    background: 'linear-gradient(135deg, #22C55E, #1A6B3C)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.3px',
  },
  rodape: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#6B8F78',
    fontSize: '0.875rem',
  },
  link: {
    color: '#22C55E',
    fontWeight: '500',
  }
}
