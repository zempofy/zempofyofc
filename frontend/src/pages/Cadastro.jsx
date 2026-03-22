import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nomeEmpresa: '', nomeAdmin: '', email: '', senha: '', confirmarSenha: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (form.senha !== form.confirmarSenha) {
      return setErro('As senhas não coincidem.')
    }
    if (form.senha.length < 6) {
      return setErro('A senha precisa ter pelo menos 6 caracteres.')
    }

    setCarregando(true)
    try {
      await cadastrar({
        nomeEmpresa: form.nomeEmpresa,
        nomeAdmin: form.nomeAdmin,
        email: form.email,
        senha: form.senha
      })
      navigate('/admin')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta.')
    } finally {
      setCarregando(false)
    }
  }

  const atualizar = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))

  return (
    <div style={styles.pagina}>
      <div style={styles.fundoDecor}>
        <div style={styles.circulo1} />
        <div style={styles.circulo2} />
        <div style={styles.grade} />
      </div>

      <div style={styles.caixa} className="fade-in">
        <div style={styles.logo}>
          <div style={styles.logoIcone}>Z</div>
          <span style={styles.logoNome}>zempofy</span>
        </div>

        <h1 style={styles.titulo}>Criar sua empresa</h1>
        <p style={styles.subtitulo}>Configure o Zempofy para o seu time</p>

        {erro && <div style={styles.erro}>{erro}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.secao}>
            <p style={styles.secaoTitulo}>Dados da empresa</p>
            <div style={styles.campo}>
              <label style={styles.label}>Nome da empresa</label>
              <input
                type="text"
                placeholder="Ex: Padaria do João"
                value={form.nomeEmpresa}
                onChange={e => atualizar('nomeEmpresa', e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.secao}>
            <p style={styles.secaoTitulo}>Dados do administrador</p>
            <div style={styles.campo}>
              <label style={styles.label}>Seu nome</label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={form.nomeAdmin}
                onChange={e => atualizar('nomeAdmin', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => atualizar('email', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.linha2}>
              <div style={styles.campo}>
                <label style={styles.label}>Senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={e => atualizar('senha', e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Confirmar senha</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmarSenha}
                  onChange={e => atualizar('confirmarSenha', e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" style={styles.botao} disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar empresa grátis'}
          </button>
        </form>

        <p style={styles.rodape}>
          Já tem conta?{' '}
          <Link to="/login" style={styles.link}>Fazer login</Link>
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
  fundoDecor: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  circulo1: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
    top: '-100px', right: '-100px',
  },
  circulo2: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,107,60,0.1) 0%, transparent 70%)',
    bottom: '-80px', left: '-80px',
  },
  grade: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  caixa: {
    background: 'rgba(17,23,20,0.95)',
    border: '1px solid #2A3830',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' },
  logoIcone: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #22C55E, #1A6B3C)',
    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '18px', color: '#fff',
  },
  logoNome: { fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '20px', color: '#E8F5EE', letterSpacing: '-0.5px' },
  titulo: { fontSize: '1.75rem', color: '#E8F5EE', marginBottom: '6px' },
  subtitulo: { color: '#6B8F78', fontSize: '0.9rem', marginBottom: '24px' },
  erro: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '12px 16px', color: '#FCA5A5',
    fontSize: '0.875rem', marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  secao: { display: 'flex', flexDirection: 'column', gap: '12px' },
  secaoTitulo: {
    fontSize: '0.7rem', fontWeight: '600', color: '#22C55E',
    textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: '1px solid #2A3830', paddingBottom: '8px',
  },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  linha2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { fontSize: '0.8rem', fontWeight: '500', color: '#6B8F78', textTransform: 'uppercase', letterSpacing: '0.8px' },
  input: {
    background: '#1E2820', border: '1px solid #2A3830', borderRadius: '10px',
    padding: '12px 16px', color: '#E8F5EE', fontSize: '0.95rem',
    transition: 'border-color 0.2s', width: '100%',
  },
  botao: {
    background: 'linear-gradient(135deg, #22C55E, #1A6B3C)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '14px', fontFamily: 'Inter, sans-serif',
    fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
    marginTop: '4px', letterSpacing: '0.3px',
  },
  rodape: { textAlign: 'center', marginTop: '20px', color: '#6B8F78', fontSize: '0.875rem' },
  link: { color: '#22C55E', fontWeight: '500' },
}
