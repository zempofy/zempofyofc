import { useState, useRef, useEffect } from 'react'
import Icone from './Icones'

const isMobile = () => window.innerWidth < 768 || ('ontouchstart' in window)

const ETAPAS = [
  { id: 'prospeccao', label: 'Prospecção', cor: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { id: 'contato', label: 'Contato feito', cor: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { id: 'reuniao', label: 'Reunião', cor: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  { id: 'proposta', label: 'Proposta enviada', cor: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { id: 'fechado', label: 'Fechado', cor: '#00b141', bg: 'rgba(0,177,65,0.08)' },
  { id: 'perdido', label: 'Perdido', cor: '#f87171', bg: 'rgba(248,113,113,0.08)' },
]

const LEADS_MOCK = [
  { id: 1, nome: 'Marcos Oliveira', empresa: 'Construções MO LTDA', telefone: '(31) 99999-1234', email: 'marcos@mo.com', etapa: 'prospeccao', valor: 'R$ 800,00/mês', origem: 'Indicação', criadoEm: '10/06/2026', criadoPor: 'Ana Lima', obs: 'Empresa de pequeno porte, Simples Nacional' },
  { id: 2, nome: 'Ana Paula Silva', empresa: 'Salão Bella Donna', telefone: '(31) 98888-5678', email: 'ana@bella.com', etapa: 'contato', valor: 'R$ 500,00/mês', origem: 'Instagram', criadoEm: '08/06/2026', criadoPor: 'Carlos Souza', obs: 'MEI, quer abrir ME em breve' },
  { id: 3, nome: 'Ricardo Ferreira', empresa: 'RF Transportes', telefone: '(31) 97777-9012', email: 'rf@transp.com', etapa: 'reuniao', valor: 'R$ 1.200,00/mês', origem: 'Site', criadoEm: '05/06/2026', criadoPor: 'Ana Lima', obs: 'Reunião marcada para semana que vem' },
  { id: 4, nome: 'Juliana Costa', empresa: 'JC Moda e Acessórios', telefone: '(31) 96666-3456', email: 'ju@jcmoda.com', etapa: 'proposta', valor: 'R$ 700,00/mês', origem: 'Indicação', criadoEm: '01/06/2026', criadoPor: 'Carlos Souza', obs: 'Proposta enviada, aguardando retorno' },
  { id: 5, nome: 'Carlos Mendes', empresa: 'Padaria Pão Nosso', telefone: '(31) 95555-7890', email: 'carlos@paon.com', etapa: 'fechado', valor: 'R$ 600,00/mês', origem: 'Indicação', criadoEm: '28/05/2026', criadoPor: 'Ana Lima', obs: 'Fechado! Iniciar onboarding' },
  { id: 6, nome: 'Fernanda Lima', empresa: 'Studio Fit Academia', telefone: '(31) 94444-2345', email: 'fe@studiofit.com', etapa: 'perdido', valor: 'R$ 900,00/mês', origem: 'Instagram', criadoEm: '20/05/2026', criadoPor: 'Carlos Souza', obs: 'Optou por outro escritório' },
]

function CardLead({ lead, onClick, onDragStart, onDragEnd, isTitular, mobile }) {
  const etapa = ETAPAS.find(e => e.id === lead.etapa)
  const dragHandle = useRef(null)

  return (
    <div
      draggable={!mobile}
      onDragStart={!mobile ? (e) => { e.dataTransfer.setData('leadId', lead.id); onDragStart && onDragStart() } : undefined}
      onDragEnd={!mobile ? onDragEnd : undefined}
      onClick={() => onClick(lead)}
      style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'10px', padding:'12px 14px', cursor:'pointer', transition:'border-color 0.12s, opacity 0.15s', position:'relative' }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(0,177,65,0.3)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--borda)'}
    >
      {/* Handle de drag — só desktop */}
      {!mobile && (
        <div style={{ position:'absolute', top:'8px', right:'10px', color:'var(--borda)', cursor:'grab', display:'flex', flexDirection:'column', gap:'2px', padding:'2px' }}
          title="Arrastar para outra etapa"
          onMouseEnter={e=>e.currentTarget.style.color='var(--texto-apagado)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--borda)'}
        >
          {[0,1].map(i=>(
            <div key={i} style={{ display:'flex', gap:'2px' }}>
              {[0,1].map(j=><div key={j} style={{ width:'3px', height:'3px', borderRadius:'50%', background:'currentColor' }}/>)}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom:'8px', paddingRight: mobile ? '0' : '16px' }}>
        <p style={{ fontSize:'0.85rem', fontWeight:'600', color:'var(--texto)', margin:0, fontFamily:'Inter,sans-serif' }}>{lead.empresa}</p>
        <p style={{ fontSize:'0.75rem', color:'var(--texto-apagado)', margin:'2px 0 0', fontFamily:'Inter,sans-serif' }}>{lead.nome}</p>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
        <span style={{ fontSize:'0.72rem', fontWeight:'600', color:'var(--verde)' }}>{lead.valor}</span>
        <span style={{ fontSize:'0.65rem', color:'var(--texto-apagado)', background:'var(--input)', padding:'1px 7px', borderRadius:'4px', border:'1px solid var(--borda)' }}>{lead.origem}</span>
      </div>
      {isTitular && (
        <p style={{ fontSize:'0.65rem', color:'var(--texto-apagado)', margin:'6px 0 0', fontFamily:'Inter,sans-serif', opacity:0.7 }}>
          por {lead.criadoPor}
        </p>
      )}
    </div>
  )
}

function DetalheDrawer({ lead, fechar, onMoverEtapa, isTitular }) {
  const etapa = ETAPAS.find(e => e.id === lead.etapa)
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex' }} onClick={fechar}>
      <div style={{ flex:1, background:'rgba(0,0,0,0.4)' }} />
      <div style={{ width:'380px', background:'var(--fundo)', borderLeft:'1px solid var(--borda)', display:'flex', flexDirection:'column', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--borda)', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:'1rem', fontWeight:'700', color:'var(--texto)', margin:0, fontFamily:'Inter,sans-serif' }}>{lead.empresa}</p>
            <p style={{ fontSize:'0.8rem', color:'var(--texto-apagado)', margin:'3px 0 0', fontFamily:'Inter,sans-serif' }}>{lead.nome}</p>
            <span style={{ fontSize:'0.68rem', fontWeight:'600', padding:'2px 8px', borderRadius:'5px', background:etapa?.bg, color:etapa?.cor, display:'inline-block', marginTop:'6px' }}>{etapa?.label}</span>
          </div>
          <button onClick={fechar} style={{ background:'none', border:'1px solid var(--borda)', borderRadius:'6px', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--texto-apagado)', flexShrink:0 }}>✕</button>
        </div>

        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'20px', flex:1 }}>
          <div style={{ background:'rgba(0,177,65,0.06)', border:'1px solid rgba(0,177,65,0.15)', borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.78rem', color:'var(--texto-apagado)', fontFamily:'Inter,sans-serif' }}>Valor estimado</span>
            <span style={{ fontSize:'1rem', fontWeight:'700', color:'var(--verde)', fontFamily:'Inter,sans-serif' }}>{lead.valor}</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {[
              { icone: <Icone.Phone size={14}/>, label:'Telefone', valor: lead.telefone },
              { icone: <Icone.Mail size={14}/>, label:'E-mail', valor: lead.email },
              { icone: <Icone.Zap size={14}/>, label:'Origem', valor: lead.origem },
              { icone: <Icone.Clock size={14}/>, label:'Adicionado em', valor: lead.criadoEm },
              ...(isTitular ? [{ icone: <Icone.Users size={14}/>, label:'Criado por', valor: lead.criadoPor }] : []),
            ].map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <span style={{ color:'var(--texto-apagado)', flexShrink:0 }}>{item.icone}</span>
                <span style={{ fontSize:'0.78rem', color:'var(--texto-apagado)', fontFamily:'Inter,sans-serif', minWidth:'80px' }}>{item.label}</span>
                <span style={{ fontSize:'0.82rem', color:'var(--texto)', fontFamily:'Inter,sans-serif' }}>{item.valor}</span>
              </div>
            ))}
          </div>

          {lead.obs && (
            <div style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'8px', padding:'12px 14px' }}>
              <p style={{ fontSize:'0.65rem', fontWeight:'700', color:'var(--texto-apagado)', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 6px', fontFamily:'Inter,sans-serif' }}>Observações</p>
              <p style={{ fontSize:'0.82rem', color:'var(--texto)', margin:0, fontFamily:'Inter,sans-serif', lineHeight:'1.5' }}>{lead.obs}</p>
            </div>
          )}

          <div>
            <p style={{ fontSize:'0.65rem', fontWeight:'700', color:'var(--texto-apagado)', textTransform:'uppercase', letterSpacing:'0.8px', margin:'0 0 10px', fontFamily:'Inter,sans-serif' }}>Mover para etapa</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {ETAPAS.filter(e=>e.id!==lead.etapa).map(e=>(
                <button key={e.id} onClick={()=>onMoverEtapa(e.id)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 12px', background:'var(--input)', border:'1px solid var(--borda)', borderRadius:'8px', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.82rem', color:'var(--texto)', textAlign:'left' }}
                  onMouseEnter={el=>el.currentTarget.style.borderColor=e.cor}
                  onMouseLeave={el=>el.currentTarget.style.borderColor='var(--borda)'}
                >
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:e.cor, flexShrink:0 }}/>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {lead.etapa === 'fechado' && (
            <div style={{ background:'rgba(0,177,65,0.06)', border:'1px solid rgba(0,177,65,0.2)', borderRadius:'10px', padding:'14px 16px' }}>
              <p style={{ fontSize:'0.78rem', color:'var(--verde)', fontWeight:'600', margin:'0 0 8px', fontFamily:'Inter,sans-serif' }}>Lead fechado!</p>
              <p style={{ fontSize:'0.75rem', color:'var(--texto-apagado)', margin:'0 0 12px', fontFamily:'Inter,sans-serif' }}>Este lead está pronto para iniciar o onboarding.</p>
              <button style={{ background:'var(--gradiente-verde)', color:'#fff', border:'none', borderRadius:'8px', padding:'8px 16px', fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'0.82rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', width:'100%', justifyContent:'center' }}>
                <Icone.ClipboardList size={14}/> Iniciar onboarding
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CRM({ isTitular = true }) {
  const [leads, setLeads] = useState(LEADS_MOCK)
  const [leadSelecionado, setLeadSelecionado] = useState(null)
  const [etapaFiltro, setEtapaFiltro] = useState(null)
  const [busca, setBusca] = useState('')
  const [dragSobre, setDragSobre] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [mobile] = useState(isMobile)

  const moverEtapa = (novaEtapa) => {
    setLeads(ls => ls.map(l => l.id === leadSelecionado.id ? { ...l, etapa: novaEtapa } : l))
    setLeadSelecionado(prev => ({ ...prev, etapa: novaEtapa }))
  }

  const onDrop = (etapaId, e) => {
    e.preventDefault()
    const leadId = parseInt(e.dataTransfer.getData('leadId'))
    setLeads(ls => ls.map(l => l.id === leadId ? { ...l, etapa: etapaId } : l))
    setDragSobre(null)
    setDragging(false)
  }

  // Leads visíveis: titular vê todos, colaborador vê só os seus
  const leadsVisiveis = isTitular ? leads : leads.filter(l => l.criadoPor === 'Você')

  const leadsFiltrados = leadsVisiveis.filter(l => {
    const matchBusca = !busca || l.empresa.toLowerCase().includes(busca.toLowerCase()) || l.nome.toLowerCase().includes(busca.toLowerCase())
    const matchEtapa = !etapaFiltro || l.etapa === etapaFiltro
    return matchBusca && matchEtapa
  })

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
            <h1 style={{ fontSize:'1.5rem', fontWeight:'700', color:'var(--texto)', margin:0, letterSpacing:'-0.03em', fontFamily:'Inter,sans-serif' }}>CRM</h1>
            <span style={{ fontSize:'0.65rem', fontWeight:'700', padding:'2px 8px', borderRadius:'4px', background:'rgba(99,102,241,0.1)', color:'#818cf8', letterSpacing:'0.5px', border:'1px solid rgba(99,102,241,0.2)' }}>BETA</span>
          </div>
          <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)', margin:0, fontFamily:'Inter,sans-serif' }}>
            {isTitular ? 'Visualizando todos os leads da equipe' : 'Visualizando seus leads'}
          </p>
        </div>
        <button style={{ background:'var(--gradiente-verde)', color:'#fff', border:'none', borderRadius:'10px', padding:'10px 20px', fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'0.875rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', opacity:0.5 }} title="Em breve">
          <Icone.Plus size={14}/> Novo lead
        </button>
      </div>

      {/* Resumo */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total de leads', valor: leadsVisiveis.length, cor:'var(--texto)' },
          { label:'Em negociação', valor: leadsVisiveis.filter(l=>!['fechado','perdido'].includes(l.etapa)).length, cor:'#3b82f6' },
          { label:'Fechados', valor: leadsVisiveis.filter(l=>l.etapa==='fechado').length, cor:'var(--verde)' },
          { label:'Perdidos', valor: leadsVisiveis.filter(l=>l.etapa==='perdido').length, cor:'#f87171' },
        ].map((item,i) => (
          <div key={i} style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'14px 18px' }}>
            <p style={{ fontSize:'0.72rem', color:'var(--texto-apagado)', margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.8px', fontFamily:'Inter,sans-serif', fontWeight:'600' }}>{item.label}</p>
            <p style={{ fontSize:'1.6rem', fontWeight:'700', color:item.cor, margin:0, fontFamily:'Inter,sans-serif', letterSpacing:'-0.02em' }}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Busca + filtro */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
        <input style={{ background:'var(--input)', border:'1px solid var(--borda)', borderRadius:'8px', padding:'8px 12px', color:'var(--texto)', fontSize:'0.85rem', fontFamily:'Inter,sans-serif', flex:1, minWidth:'200px', boxSizing:'border-box' }} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar lead..." />
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          <button onClick={()=>setEtapaFiltro(null)} style={{ padding:'7px 12px', borderRadius:'7px', fontSize:'0.75rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', border:`1px solid ${!etapaFiltro?'rgba(0,177,65,0.3)':'var(--borda)'}`, background:!etapaFiltro?'rgba(0,177,65,0.08)':'var(--input)', color:!etapaFiltro?'var(--verde)':'var(--texto-apagado)' }}>Todos</button>
          {ETAPAS.map(e=>(
            <button key={e.id} onClick={()=>setEtapaFiltro(etapaFiltro===e.id?null:e.id)} style={{ padding:'7px 12px', borderRadius:'7px', fontSize:'0.75rem', fontWeight:'600', cursor:'pointer', fontFamily:'Inter,sans-serif', border:`1px solid ${etapaFiltro===e.id?e.cor+'50':'var(--borda)'}`, background:etapaFiltro===e.id?e.bg:'var(--input)', color:etapaFiltro===e.id?e.cor:'var(--texto-apagado)' }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dica drag — só desktop */}
      {!mobile && (
        <p style={{ fontSize:'0.72rem', color:'var(--texto-apagado)', margin:'0 0 12px', fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', gap:'5px' }}>
          <Icone.Edit size={12}/> Arraste os cards pelos pontinhos para mover entre etapas
        </p>
      )}

      {/* Pipeline Kanban */}
      <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'16px', alignItems:'flex-start' }}>
        {ETAPAS.map(etapa => {
          const leadsEtapa = leadsFiltrados.filter(l=>l.etapa===etapa.id)
          const sobreDrop = dragSobre === etapa.id
          return (
            <div
              key={etapa.id}
              onDragOver={!mobile ? (e)=>{ e.preventDefault(); setDragSobre(etapa.id) } : undefined}
              onDragLeave={!mobile ? ()=>setDragSobre(null) : undefined}
              onDrop={!mobile ? (e)=>onDrop(etapa.id, e) : undefined}
              style={{ flex:'0 0 220px', display:'flex', flexDirection:'column', gap:'8px', transition:'all 0.15s' }}
            >
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:'8px', background: sobreDrop ? etapa.bg : 'var(--card)', border:`1px solid ${sobreDrop ? etapa.cor+'50' : 'var(--borda)'}`, transition:'all 0.15s' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:etapa.cor, flexShrink:0 }}/>
                  <span style={{ fontSize:'0.8rem', fontWeight:'600', color:'var(--texto)', fontFamily:'Inter,sans-serif' }}>{etapa.label}</span>
                </div>
                <span style={{ fontSize:'0.72rem', fontWeight:'600', padding:'2px 7px', borderRadius:'99px', background:etapa.bg, color:etapa.cor }}>{leadsEtapa.length}</span>
              </div>
              <div style={{ minHeight: sobreDrop ? '60px' : 'auto', borderRadius:'8px', border: sobreDrop ? `2px dashed ${etapa.cor}50` : '2px solid transparent', transition:'all 0.15s', display:'flex', flexDirection:'column', gap:'8px', padding: sobreDrop ? '4px' : '0' }}>
                {leadsEtapa.length === 0 && !sobreDrop ? (
                  <div style={{ padding:'20px 12px', textAlign:'center', color:'var(--texto-apagado)', fontSize:'0.75rem', fontFamily:'Inter,sans-serif', border:'1px dashed var(--borda)', borderRadius:'8px' }}>Nenhum lead</div>
                ) : (
                  leadsEtapa.map(lead => (
                    <CardLead
                      key={lead.id}
                      lead={lead}
                      onClick={setLeadSelecionado}
                      onDragStart={()=>setDragging(true)}
                      onDragEnd={()=>{ setDragging(false); setDragSobre(null) }}
                      isTitular={isTitular}
                      mobile={mobile}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Aviso beta */}
      <div style={{ marginTop:'20px', padding:'12px 16px', background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px' }}>
        <Icone.AlertTriangle size={14} style={{ color:'#818cf8', flexShrink:0 }}/>
        <p style={{ fontSize:'0.78rem', color:'#818cf8', margin:0, fontFamily:'Inter,sans-serif' }}>
          O CRM está em desenvolvimento. Os dados exibidos são apenas demonstrativos. Em breve será possível cadastrar e gerenciar leads reais.
        </p>
      </div>

      {leadSelecionado && (
        <DetalheDrawer
          lead={leadSelecionado}
          fechar={()=>setLeadSelecionado(null)}
          onMoverEtapa={moverEtapa}
          isTitular={isTitular}
        />
      )}
    </div>
  )
}
