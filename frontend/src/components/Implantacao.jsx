import { useState, useEffect } from 'react'
import api from '../services/api'
import { useToast } from './Toast'

// ── Tela de detalhe de uma implantação ──
function DetalheImplantacao({ implantacao: inicial, voltar, onAtualizado }) {
  const [implantacao, setImplantacao] = useState(inicial)
  const [etapaSelecionada, setEtapaSelecionada] = useState(
    () => inicial.etapas.find(e => e.status === 'em_andamento') || inicial.etapas[0]
  )
  const { mostrar: toast } = useToast()

  const recarregar = async () => {
    try {
      const res = await api.get(`/implantacoes/${implantacao._id}`)
      setImplantacao(res.data)
      const etapaAtual = res.data.etapas.find(e => e._id === etapaSelecionada._id)
      if (etapaAtual) setEtapaSelecionada(etapaAtual)
      onAtualizado()
    } catch { toast('Erro ao atualizar.', 'erro') }
  }

  const toggleTarefa = async (etapa, tarefa) => {
    const rota = tarefa.status === 'pendente' ? 'concluir' : 'desmarcar'
    try {
      await api.patch(`/implantacoes/${implantacao._id}/tarefas/${etapa._id}/${tarefa._id}/${rota}`)
      await recarregar()
    } catch { toast('Erro ao atualizar tarefa.', 'erro') }
  }

  const progresso = () => {
    const total = implantacao.etapas.length
    const concluidas = implantacao.etapas.filter(e => e.status === 'concluida').length
    return total > 0 ? Math.round((concluidas / total) * 100) : 0
  }

  const etapaExibida = implantacao.etapas.find(e => e._id === etapaSelecionada._id) || etapaSelecionada

  return (
    <div>
      {/* Voltar */}
      <button style={s.btnVoltar} onClick={voltar}>
        ← Onboarding
      </button>

      {/* Cabeçalho */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={s.titulo}>{implantacao.nomeCliente}</h1>
        <p style={s.subtitulo}>
          {implantacao.cnpj && `${implantacao.cnpj} · `}
          {implantacao.modelo?.nome && `${implantacao.modelo.nome} · `}
          Iniciado em {new Date(implantacao.criadoEm).toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Barra de progresso */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={s.labelProg}>Progresso geral</span>
          <span style={s.labelProg}>{implantacao.etapas.filter(e => e.status === 'concluida').length} de {implantacao.etapas.length} etapas</span>
        </div>
        <div style={s.baraBg}>
          <div style={{ ...s.baraFill, width: `${progresso()}%` }} />
        </div>
      </div>

      {/* Timeline de setores */}
      <div style={s.timeline}>
        {implantacao.etapas.map((etapa, idx) => {
          const ativa = etapa._id === etapaExibida._id
          const cor = etapa.setor?.cor || '#2DAA59'
          return (
            <div key={etapa._id} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: etapa.status !== 'bloqueada' ? 'pointer' : 'default' }}
                onClick={() => etapa.status !== 'bloqueada' && setEtapaSelecionada(etapa)}
              >
                <div style={{
                  ...s.stepCircle,
                  background: etapa.status === 'concluida' ? '#2DAA59' : etapa.status === 'em_andamento' ? `${cor}22` : 'var(--input)',
                  border: ativa ? `2px solid ${cor}` : etapa.status === 'concluida' ? '2px solid #2DAA59' : '1px solid #2A3830',
                  color: etapa.status === 'concluida' ? '#fff' : etapa.status === 'em_andamento' ? cor : 'var(--texto-apagado)'
                }}>
                  {etapa.status === 'concluida' ? '✓' : idx + 1}
                </div>
                <span style={{
                  ...s.stepLabel,
                  color: ativa ? cor : etapa.status === 'bloqueada' ? 'var(--texto-apagado)' : 'var(--texto)',
                  fontWeight: ativa ? '600' : '400'
                }}>
                  {etapa.setor?.nome}
                </span>
              </div>
              {idx < implantacao.etapas.length - 1 && (
                <div style={{
                  ...s.connector,
                  background: etapa.status === 'concluida' ? '#2DAA59' : '#2A3830'
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Tarefas da etapa selecionada */}
      {etapaExibida && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: etapaExibida.setor?.cor || '#2DAA59' }} />
            <h2 style={s.secaoTitulo}>Tarefas — {etapaExibida.setor?.nome}</h2>
            {etapaExibida.status === 'bloqueada' && (
              <span style={s.badgeBloqueado}>🔒 Bloqueada</span>
            )}
          </div>

          {etapaExibida.status === 'bloqueada' ? (
            <p style={{ color: 'var(--texto-apagado)', fontSize: '0.875rem' }}>
              Esta etapa será liberada quando a anterior for concluída.
            </p>
          ) : etapaExibida.tarefas.length === 0 ? (
            <p style={{ color: 'var(--texto-apagado)', fontSize: '0.875rem' }}>Nenhuma tarefa nesta etapa.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {etapaExibida.tarefas.map(tarefaEtapa => (
                <div
                  key={tarefaEtapa._id}
                  style={{ ...s.tarefaCard, opacity: etapaExibida.status === 'bloqueada' ? 0.5 : 1 }}
                  onClick={() => etapaExibida.status !== 'bloqueada' && toggleTarefa(etapaExibida, tarefaEtapa)}
                >
                  <div style={{
                    ...s.check,
                    background: tarefaEtapa.status === 'concluida' ? '#2DAA59' : 'transparent',
                    borderColor: tarefaEtapa.status === 'concluida' ? '#2DAA59' : '#2A3830'
                  }}>
                    {tarefaEtapa.status === 'concluida' && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
                  </div>
                  <span style={{
                    ...s.tarefaDesc,
                    textDecoration: tarefaEtapa.status === 'concluida' ? 'line-through' : 'none',
                    color: tarefaEtapa.status === 'concluida' ? 'var(--texto-apagado)' : 'var(--texto)'
                  }}>
                    {tarefaEtapa.tarefa?.descricao || 'Tarefa'}
                  </span>
                  {tarefaEtapa.tarefa?.responsavel?.nome && (
                    <span style={s.tarefaResp}>{tarefaEtapa.tarefa.responsavel.nome}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Modal para nova implantação ──
function ModalNovaImplantacao({ fechar, onCriado }) {
  const [nomeCliente, setNomeCliente] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [modeloId, setModeloId] = useState('')
  const [modelos, setModelos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const { mostrar: toast } = useToast()

  useEffect(() => {
    api.get('/modelos-onboarding').then(r => setModelos(r.data)).catch(() => {})
  }, [])

  const criar = async () => {
    if (!nomeCliente.trim()) return setErro('Nome do cliente é obrigatório.')
    setCarregando(true); setErro('')
    try {
      await api.post('/implantacoes', { nomeCliente, cnpj, modeloId: modeloId || undefined })
      toast('Implantação criada!', 'sucesso')
      onCriado(); fechar()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar implantação.')
    } finally { setCarregando(false) }
  }

  return (
    <div style={s.overlay} onClick={fechar}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalTopo}>
          <span style={s.modalTitulo}>Nova implantação</span>
          <button style={s.btnX} onClick={fechar}>✕</button>
        </div>
        <div style={s.modalCorpo}>
          {erro && <p style={s.erro}>{erro}</p>}
          <div style={s.campo}>
            <label style={s.label}>Nome do cliente</label>
            <input style={s.input} value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} placeholder="Razão social ou nome fantasia" autoFocus />
          </div>
          <div style={s.campo}>
            <label style={s.label}>CNPJ (opcional)</label>
            <input style={s.input} value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </div>
          <div style={s.campo}>
            <label style={s.label}>Modelo de onboarding</label>
            <select style={s.input} value={modeloId} onChange={e => setModeloId(e.target.value)}>
              <option value="">Sem modelo (criar manualmente)</option>
              {modelos.map(m => <option key={m._id} value={m._id}>{m.nome}</option>)}
            </select>
          </div>
        </div>
        <div style={s.modalRodape}>
          <button style={s.btnCancelar} onClick={fechar}>Cancelar</button>
          <button style={s.btnSalvar} onClick={criar} disabled={carregando}>
            {carregando ? 'Criando...' : 'Criar implantação'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tela principal ──
export default function Implantacao() {
  const [implantacoes, setImplantacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [detalheSelecionado, setDetalheSelecionado] = useState(null)
  const { mostrar: toast } = useToast()

  const buscar = async () => {
    setCarregando(true)
    try {
      const res = await api.get('/implantacoes')
      setImplantacoes(res.data)
    } catch { toast('Erro ao carregar implantações.', 'erro') }
    finally { setCarregando(false) }
  }

  useEffect(() => { buscar() }, [])

  if (detalheSelecionado) {
    return (
      <DetalheImplantacao
        implantacao={detalheSelecionado}
        voltar={() => { setDetalheSelecionado(null); buscar() }}
        onAtualizado={buscar}
      />
    )
  }

  const filtradas = implantacoes.filter(i =>
    i.nomeCliente.toLowerCase().includes(busca.toLowerCase()) ||
    (i.cnpj || '').includes(busca)
  )

  const progresso = (imp) => {
    const total = imp.etapas.length
    const concluidas = imp.etapas.filter(e => e.status === 'concluida').length
    return total > 0 ? Math.round((concluidas / total) * 100) : 0
  }

  const etapaAtual = (imp) => imp.etapas.find(e => e.status === 'em_andamento')

  const iniciais = (nome) => nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.titulo}>Onboarding</h1>
        <button style={s.btnNovo} onClick={() => setModalAberto(true)}>+ Nova empresa</button>
      </div>

      <input
        style={{ ...s.input, marginBottom: '20px' }}
        value={busca}
        onChange={e => setBusca(e.target.value)}
        placeholder="Pesquisar empresa..."
      />

      {carregando ? (
        <p style={s.vazio}>Carregando...</p>
      ) : filtradas.length === 0 ? (
        <div style={s.vazioBox}>
          <p style={{ color: 'var(--texto-apagado)', marginBottom: '12px' }}>
            {busca ? 'Nenhuma empresa encontrada.' : 'Nenhuma implantação em andamento.'}
          </p>
          {!busca && <button style={s.btnNovo} onClick={() => setModalAberto(true)}>Adicionar primeira empresa</button>}
        </div>
      ) : (
        <div style={s.grid}>
          {filtradas.map(imp => {
            const etapa = etapaAtual(imp)
            const pct = progresso(imp)
            return (
              <div key={imp._id} style={s.card} onClick={() => setDetalheSelecionado(imp)}>
                <div style={s.cardTopo}>
                  <div style={s.avatar}>{iniciais(imp.nomeCliente)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.cardNome}>{imp.nomeCliente}</p>
                    {imp.cnpj && <p style={s.cardCnpj}>{imp.cnpj}</p>}
                  </div>
                </div>
                <hr style={s.divisor} />
                <p style={s.labelMini}>Etapa atual</p>
                {etapa ? (
                  <span style={{ ...s.etapaBadge, background: `${etapa.setor?.cor || '#2DAA59'}22`, color: etapa.setor?.cor || '#2DAA59' }}>
                    {etapa.setor?.nome || 'Em andamento'}
                  </span>
                ) : (
                  <span style={{ ...s.etapaBadge, background: 'rgba(34,197,94,0.1)', color: '#2DAA59' }}>Concluído ✓</span>
                )}
                <p style={{ ...s.labelMini, marginTop: '10px' }}>Progresso</p>
                <div style={s.baraBg}>
                  <div style={{ ...s.baraFill, width: `${pct}%` }} />
                </div>
              </div>
            )
          })}

          {/* Card de adicionar */}
          <div style={{ ...s.card, ...s.cardAdd }} onClick={() => setModalAberto(true)}>
            <div style={s.addIcone}>+</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--texto-apagado)', margin: 0 }}>Nova empresa</p>
          </div>
        </div>
      )}

      {modalAberto && (
        <ModalNovaImplantacao fechar={() => setModalAberto(false)} onCriado={buscar} />
      )}
    </div>
  )
}

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  titulo: { fontSize: '1.4rem', fontWeight: '700', color: 'var(--texto)', margin: 0, fontFamily: 'Inter, sans-serif' },
  subtitulo: { fontSize: '0.82rem', color: 'var(--texto-apagado)', marginTop: '4px', fontFamily: 'Inter, sans-serif' },
  btnNovo: {
    background: 'linear-gradient(135deg, #22C55E, #1A6B3C)',
    color: '#fff', border: 'none', borderRadius: '10px',
    padding: '10px 20px', fontFamily: 'Inter, sans-serif',
    fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer'
  },
  input: {
    background: 'var(--input)', border: '1px solid #2A3830', borderRadius: '10px',
    padding: '10px 14px', color: 'var(--texto)', fontSize: '0.9rem',
    fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' },
  card: {
    background: 'var(--input)', border: '1px solid #2A3830', borderRadius: '14px',
    padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s'
  },
  cardAdd: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: '130px', border: '1.5px dashed #2A3830'
  },
  addIcone: {
    width: '32px', height: '32px', borderRadius: '50%', border: '1.5px dashed #2A3830',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--texto-apagado)', fontSize: '20px', marginBottom: '8px'
  },
  cardTopo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(34,197,94,0.15)', color: 'var(--verde)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700', flexShrink: 0, fontFamily: 'Inter, sans-serif'
  },
  cardNome: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--texto)', margin: 0, fontFamily: 'Inter, sans-serif' },
  cardCnpj: { fontSize: '0.75rem', color: 'var(--texto-apagado)', margin: '2px 0 0', fontFamily: 'Inter, sans-serif' },
  divisor: { border: 'none', borderTop: '1px solid #2A3830', margin: '10px 0' },
  labelMini: { fontSize: '0.7rem', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px', fontFamily: 'Inter, sans-serif' },
  etapaBadge: { display: 'inline-block', fontSize: '0.78rem', fontWeight: '500', padding: '3px 10px', borderRadius: '99px', fontFamily: 'Inter, sans-serif' },
  baraBg: { height: '5px', background: '#2A3830', borderRadius: '99px', overflow: 'hidden' },
  baraFill: { height: '100%', background: '#2DAA59', borderRadius: '99px', transition: 'width 0.3s' },
  // Detalhe
  btnVoltar: {
    background: 'none', border: 'none', color: 'var(--texto-apagado)',
    cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
    marginBottom: '20px', padding: 0
  },
  labelProg: { fontSize: '0.75rem', color: 'var(--texto-apagado)', fontFamily: 'Inter, sans-serif' },
  timeline: { display: 'flex', alignItems: 'flex-start', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' },
  stepCircle: {
    width: '34px', height: '34px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '600', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif'
  },
  stepLabel: { fontSize: '0.7rem', marginTop: '6px', textAlign: 'center', maxWidth: '70px', fontFamily: 'Inter, sans-serif' },
  connector: { flex: 1, height: '2px', minWidth: '16px', margin: '16px 0 0' },
  secaoTitulo: { fontSize: '1rem', fontWeight: '600', color: 'var(--texto)', margin: 0, fontFamily: 'Inter, sans-serif' },
  badgeBloqueado: { fontSize: '0.75rem', color: 'var(--texto-apagado)', background: 'var(--input)', padding: '3px 10px', borderRadius: '99px', border: '1px solid #2A3830' },
  tarefaCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'var(--input)', border: '1px solid #2A3830', borderRadius: '10px',
    padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.15s'
  },
  check: { width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tarefaDesc: { fontSize: '0.875rem', flex: 1, fontFamily: 'Inter, sans-serif' },
  tarefaResp: { fontSize: '0.75rem', color: 'var(--texto-apagado)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
  vazio: { color: 'var(--texto-apagado)', fontSize: '0.9rem', textAlign: 'center', marginTop: '40px' },
  vazioBox: { textAlign: 'center', marginTop: '60px' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: 'var(--sidebar)', border: '1px solid #2A3830', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' },
  modalTopo: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #2A3830' },
  modalTitulo: { fontWeight: '700', fontSize: '1rem', color: 'var(--texto)', fontFamily: 'Inter, sans-serif' },
  btnX: { background: 'none', border: '1px solid #2A3830', borderRadius: '6px', color: 'var(--texto-apagado)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' },
  modalCorpo: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  modalRodape: { display: 'flex', gap: '12px', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #2A3830' },
  campo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.7rem', fontWeight: '600', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Inter, sans-serif' },
  btnCancelar: { background: 'none', border: '1px solid #2A3830', borderRadius: '10px', color: 'var(--texto-apagado)', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: '500', fontSize: '0.875rem', cursor: 'pointer' },
  btnSalvar: { background: 'linear-gradient(135deg, #22C55E, #1A6B3C)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer' },
  erro: { color: '#FCA5A5', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '8px' },
}
