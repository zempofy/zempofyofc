import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from './Toast'
import Icone from './Icones'

export default function ConfigAlertas() {
  const [dias, setDias] = useState(7)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const { mostrar } = useToast()

  useEffect(() => {
    api.get('/empresa/me').then(r => {
      setDias(r.data.alertaOnboardingDias || 7)
    }).catch(() => {}).finally(() => setCarregando(false))
  }, [])

  const salvar = async () => {
    setSalvando(true)
    try {
      await api.put('/empresa/configuracoes', { alertaOnboardingDias: dias })
      mostrar('Configuração salva!', 'sucesso')
    } catch {
      mostrar('Erro ao salvar.', 'erro')
    } finally { setSalvando(false) }
  }

  if (carregando) return <p style={{ color:'var(--texto-apagado)', fontFamily:'Inter,sans-serif' }}>Carregando...</p>

  return (
    <div>
      <h2 style={{ fontSize:'1.2rem', fontWeight:'700', color:'var(--texto)', margin:'0 0 6px', letterSpacing:'-0.02em', fontFamily:'Inter,sans-serif' }}>Alertas</h2>
      <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)', margin:'0 0 24px', fontFamily:'Inter,sans-serif' }}>Configure os alertas automáticos do sistema.</p>

      <div style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'20px 24px', maxWidth:'480px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
          <Icone.AlertTriangle size={16} style={{ color:'#f59e0b' }}/>
          <p style={{ fontSize:'0.9rem', fontWeight:'600', color:'var(--texto)', margin:0, fontFamily:'Inter,sans-serif' }}>Onboarding parado</p>
        </div>
        <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)', margin:'0 0 16px', fontFamily:'Inter,sans-serif', lineHeight:'1.5' }}>
          Enviar alerta por e-mail quando um onboarding ficar sem movimentação por mais de X dias.
        </p>

        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
          <label style={{ fontSize:'0.78rem', fontWeight:'600', color:'var(--texto-apagado)', textTransform:'uppercase', letterSpacing:'0.8px', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap' }}>
            Dias sem movimentação
          </label>
          <select
            value={dias}
            onChange={e=>setDias(Number(e.target.value))}
            style={{ background:'var(--input)', border:'1px solid var(--borda)', borderRadius:'8px', padding:'7px 12px', color:'var(--texto)', fontSize:'0.85rem', fontFamily:'Inter,sans-serif', colorScheme:'dark' }}
          >
            {[3,5,7,10,14,21,30].map(d => (
              <option key={d} value={d}>{d} dias{d===7?' (padrão)':''}</option>
            ))}
          </select>
        </div>

        <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:'8px', padding:'12px 14px', marginBottom:'20px', display:'flex', gap:'8px', alignItems:'flex-start' }}>
          <Icone.AlertTriangle size={13} style={{ color:'#f59e0b', flexShrink:0, marginTop:'2px' }}/>
          <p style={{ fontSize:'0.75rem', color:'#f59e0b', margin:0, fontFamily:'Inter,sans-serif', lineHeight:'1.5' }}>
            O alerta é enviado diariamente às 8h para o e-mail do titular da empresa.
          </p>
        </div>

        <button onClick={salvar} disabled={salvando} style={{ background:'var(--gradiente-verde)', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 20px', fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'0.85rem', cursor:'pointer' }}>
          {salvando ? 'Salvando...' : 'Salvar configuração'}
        </button>
      </div>
    </div>
  )
}
