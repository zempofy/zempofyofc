import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { useToast } from './Toast'

export default function WidgetFeedback() {
  const { usuario } = useAuth()
  const { mostrar } = useToast()
  const [aberto, setAberto] = useState(false)
  const [tipo, setTipo] = useState('ideia') // ideia | bug | elogio
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async () => {
    if (!mensagem.trim()) return
    setEnviando(true)
    try {
      await api.post('/feedback', {
        tipo,
        mensagem: mensagem.trim(),
        nome: usuario?.nome,
        email: usuario?.email,
        empresa: usuario?.empresa?.nome,
      })
      setEnviado(true)
      setMensagem('')
      setTimeout(() => {
        setEnviado(false)
        setAberto(false)
      }, 2500)
    } catch {
      mostrar('Erro ao enviar feedback.', 'erro')
    } finally {
      setEnviando(false)
    }
  }

  const tiposOpcoes = [
    { value: 'ideia', label: '💡 Ideia', desc: 'Sugestão de melhoria' },
    { value: 'bug', label: '🐛 Bug', desc: 'Algo não está funcionando' },
    { value: 'elogio', label: '⭐ Elogio', desc: 'Algo que você gostou' },
  ]

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 199,
          background: aberto ? '#27272a' : 'linear-gradient(135deg, #00b141, #008f34)',
          color: '#fff', border: 'none', borderRadius: '50px',
          padding: '12px 20px', fontFamily: 'Inter, sans-serif',
          fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
          boxShadow: aberto ? '0 2px 8px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,177,65,0.4)',
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        {aberto ? (
          <><span style={{ fontSize: '1rem' }}>✕</span> Fechar</>
        ) : (
          <><span style={{ fontSize: '1rem' }}>💬</span> Feedback</>
        )}
      </button>

      {/* Popup */}
      {aberto && (
        <div style={{
          position: 'fixed', bottom: '76px', right: '24px', zIndex: 198,
          background: '#18181b', border: '1px solid #27272a',
          borderRadius: '18px', width: '320px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden', animation: 'slideUp 0.2s ease',
        }}>
          {/* Topo */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #27272a', background: '#1c1c1f' }}>
            <p style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fafafa', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>
              Deixe seu feedback
            </p>
            <p style={{ fontSize: '0.78rem', color: '#71717a', margin: 0 }}>
              Sua opinião ajuda a melhorar o sistema
            </p>
          </div>

          {enviado ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎉</div>
              <p style={{ fontWeight: '700', color: '#fafafa', margin: '0 0 6px', fontFamily: 'Inter, sans-serif' }}>Obrigado!</p>
              <p style={{ fontSize: '0.82rem', color: '#71717a', margin: 0 }}>Seu feedback foi enviado com sucesso.</p>
            </div>
          ) : (
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tipos */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {tiposOpcoes.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTipo(t.value)}
                    style={{
                      flex: 1, padding: '8px 6px', borderRadius: '10px', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: '600',
                      transition: 'all 0.15s',
                      background: tipo === t.value ? 'rgba(0,177,65,0.12)' : '#09090b',
                      border: tipo === t.value ? '1px solid rgba(0,177,65,0.3)' : '1px solid #27272a',
                      color: tipo === t.value ? '#00b141' : '#71717a',
                    }}
                  >
                    <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>{t.label.split(' ')[0]}</div>
                    {t.label.split(' ')[1]}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
                placeholder={
                  tipo === 'ideia' ? 'Descreva sua sugestão...' :
                  tipo === 'bug' ? 'O que aconteceu? Como reproduzir?' :
                  'O que você gostou?'
                }
                rows={4}
                style={{
                  background: '#09090b', border: '1px solid #27272a',
                  borderRadius: '10px', padding: '10px 12px',
                  color: '#fafafa', fontSize: '0.85rem',
                  fontFamily: 'Inter, sans-serif', resize: 'none',
                  width: '100%', boxSizing: 'border-box', lineHeight: '1.5',
                  outline: 'none',
                }}
              />

              {/* Botão enviar */}
              <button
                onClick={enviar}
                disabled={enviando || !mensagem.trim()}
                style={{
                  background: mensagem.trim() ? 'linear-gradient(135deg, #00b141, #008f34)' : '#27272a',
                  color: mensagem.trim() ? '#fff' : '#71717a',
                  border: 'none', borderRadius: '10px', padding: '11px',
                  fontFamily: 'Inter, sans-serif', fontWeight: '600',
                  fontSize: '0.875rem', cursor: mensagem.trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  boxShadow: mensagem.trim() ? '0 2px 8px rgba(0,177,65,0.3)' : 'none',
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar feedback'}
              </button>

              <p style={{ fontSize: '0.72rem', color: '#3f3f46', textAlign: 'center', margin: 0 }}>
                Enviado como {usuario?.nome}
              </p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
