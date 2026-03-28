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
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: '#09090b',
    position: 'relative',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '40px 20px',
  },
  fundoDecor: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  circulo1: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,177,65,0.07) 0%, transparent 70%)',
    top: '-100px', right: '-100px',
  },
  circulo2: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,143,52,0.08) 0%, transparent 70%)',
    bottom: '-80px', left: '-80px',
  },
  grade: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(0,177,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,177,65,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  caixa: {
    background: 'rgba(17,17,19,0.97)',
    border: '1px solid #27272a',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '480px',
    position: 'relative',
    zIndex: 1,
    backdropFilter: 'blur(20px)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' },
  logoIcone: {
    width: '36px', height: '36px',
    background: 'linear-gradient(135deg, #00b141, #008f34)',
    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '18px', color: '#fff',
    boxShadow: '0 2px 8px rgba(0,177,65,0.35)',
  },
  logoNome: { fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '20px', color: '#fafafa', letterSpacing: '-0.5px' },
  titulo: { fontSize: '1.6rem', color: '#fafafa', marginBottom: '6px', letterSpacing: '-0.03em', fontWeight: '700' },
  subtitulo: { color: '#71717a', fontSize: '0.9rem', marginBottom: '24px' },
  erro: {
    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
    borderRadius: '10px', padding: '12px 16px', color: '#f87171',
    fontSize: '0.875rem', marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  secao: { display: 'flex', flexDirection: 'column', gap: '12px' },
  secaoTitulo: {
    fontSize: '0.68rem', fontWeight: '700', color: '#00b141',
    textTransform: 'uppercase', letterSpacing: '1.5px',
    borderBottom: '1px solid #27272a', paddingBottom: '8px',
  },
  campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  linha2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  label: { fontSize: '0.72rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px' },
  input: {
    background: '#1c1c1f', border: '1px solid #27272a', borderRadius: '10px',
    padding: '12px 16px', color: '#fafafa', fontSize: '0.95rem',
    transition: 'border-color 0.2s, box-shadow 0.2s', width: '100%',
    fontFamily: 'Inter, sans-serif',
  },
  botao: {
    background: 'linear-gradient(135deg, #00b141, #008f34)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '14px', fontFamily: 'Inter, sans-serif',
    fontWeight: '600', fontSize: '1rem', cursor: 'pointer',
    marginTop: '4px', letterSpacing: '0.3px',
    boxShadow: '0 2px 12px rgba(0,177,65,0.35)',
  },
  rodape: { textAlign: 'center', marginTop: '20px', color: '#71717a', fontSize: '0.875rem' },
  link: { color: '#00b141', fontWeight: '600' },
}
