import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/Layout'
import api from '../services/api'
import Agenda from '../components/Agenda'
import Icone from '../components/Icones'
import Chat from '../components/Chat'
import Anotacoes from '../components/Anotacoes'
import Mural from '../components/Mural'
import Relatorios from '../components/Relatorios'

function PaginaMinhasTarefas({ tarefas, recarregar }) {
  const { usuario } = useAuth()
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({ descricao: '', data: '', hora: '', local: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [idsOnboarding, setIdsOnboarding] = useState(new Set())

  // Busca implantações para identificar tarefas de onboarding
  useEffect(() => {
    api.get('/implantacoes').then(res => {
      const ids = new Set()
      res.data.forEach(imp => {
        imp.etapas?.forEach(etapa => {
          etapa.tarefas?.forEach(t => {
            if (t.tarefa) ids.add(typeof t.tarefa === 'object' ? t.tarefa._id : t.tarefa)
          })
        })
      })
      setIdsOnboarding(ids)
    }).catch(() => {})
  }, [tarefas])

  const tarefasNormais = tarefas.filter(t => !idsOnboarding.has(t._id))
  const tarefasOnboarding = tarefas.filter(t => idsOnboarding.has(t._id))

  const normaisPendentes = tarefasNormais.filter(t => t.status === 'pendente')
  const normaisConcluidas = tarefasNormais.filter(t => t.status === 'concluida')
  const onbPendentes = tarefasOnboarding.filter(t => t.status === 'pendente')
  const onbConcluidas = tarefasOnboarding.filter(t => t.status === 'concluida')
  const totalPendentes = tarefas.filter(t => t.status === 'pendente').length
  const totalConcluidas = tarefas.filter(t => t.status === 'concluida').length

  const concluir = async (id) => {
    await api.patch(`/tarefas/${id}/concluir`)
    recarregar()
  }

  const criar = async (e) => {
    e.preventDefault()
    if (!form.descricao.trim()) return setErro('Descrição é obrigatória.')
    setSalvando(true); setErro('')
    try {
      await api.post('/tarefas', { ...form, responsavelId: usuario?._id || usuario?.id })
      setForm({ descricao: '', data: '', hora: '', local: '' })
      setMostrarForm(false)
      recarregar()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar tarefa.')
    } finally {
      setSalvando(false)
    }
  }

  const CardSimples = ({ t, concluida = false }) => (
    <div style={{ ...styles.cardTarefa, opacity: concluida ? 0.55 : 1 }}>
      <div style={{ flex: 1 }}>
        <p style={{ ...styles.tarefaDesc, textDecoration: concluida ? 'line-through' : 'none' }}>{t.descricao}</p>
        <p style={styles.tarefaMeta}>
          {t.local && t.local}
          {t.data && ` · ${t.data.split('-').reverse().join('/')}`}
          {t.hora && ` · ${t.hora}`}
          {concluida && t.concluidaEm && ` · Concluída em ${new Date(t.concluidaEm).toLocaleDateString('pt-BR')}`}
        </p>
      </div>
      {!concluida && (
        <button style={styles.btnVerde} onClick={() => concluir(t._id)}>
          <Icone.Check size={14} /> Concluir
        </button>
      )}
    </div>
  )

  return (
    <div>
      <div style={styles.cabecalho}>
        <div>
          <h1 style={styles.titulo}>Minhas Tarefas</h1>
          <p style={styles.subtitulo}>{totalPendentes} pendente(s) · {totalConcluidas} concluída(s)</p>
        </div>
        <button
          style={{ background: mostrarForm ? 'none' : 'var(--gradiente-verde)', color: mostrarForm ? 'var(--texto-apagado)' : '#fff', border: mostrarForm ? '1px solid var(--borda)' : 'none', borderRadius: '10px', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', boxShadow: mostrarForm ? 'none' : '0 2px 8px rgba(0,177,65,0.3)' }}
          onClick={() => { setMostrarForm(!mostrarForm); setErro('') }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nova tarefa'}
        </button>
      </div>

      {/* Formulário nova tarefa */}
      {mostrarForm && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: '14px', padding: '20px', marginBottom: '24px', boxShadow: 'var(--sombra-card)' }}>
          <h3 style={{ color: 'var(--texto)', marginBottom: '16px', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}>Nova tarefa</h3>
          {erro && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '12px', background: 'rgba(248,113,113,0.08)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.2)' }}>{erro}</p>}
          <form onSubmit={criar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Descrição</label>
              <input style={{ background: 'var(--input)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '10px 14px', color: 'var(--texto)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' }}
                placeholder="O que precisa ser feito?" value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })} autoFocus required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Data</label>
              <input style={{ background: 'var(--input)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '10px 14px', color: 'var(--texto)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' }}
                type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Hora</label>
              <input style={{ background: 'var(--input)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '10px 14px', color: 'var(--texto)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' }}
                type="time" value={form.hora} onChange={e => setForm({ ...form, hora: e.target.value })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Local</label>
              <input style={{ background: 'var(--input)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '10px 14px', color: 'var(--texto)', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box' }}
                placeholder="Ex: Escritório..." value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} />
            </div>
            <button type="submit" disabled={salvando}
              style={{ background: 'var(--gradiente-verde)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,177,65,0.3)', alignSelf: 'end' }}>
              {salvando ? 'Salvando...' : 'Criar'}
            </button>
          </form>
        </div>
      )}

      {/* ── TAREFAS DE ONBOARDING ── */}
      <div style={styles.secao}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--borda)' }}>
          <h2 style={{ ...styles.secaoTitulo, margin: 0, border: 'none', padding: 0 }}>Onboarding de clientes</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--verde)', background: 'var(--verde-glow)', borderRadius: '20px', padding: '2px 8px', border: '1px solid rgba(0,177,65,0.2)' }}>
            {onbPendentes.length} pendente(s)
          </span>
        </div>
        {onbPendentes.length === 0 && onbConcluidas.length === 0 ? (
          <div style={styles.vazio}>
            <Icone.ClipboardList size={32} style={{ color: 'var(--borda)', opacity: 0.5 }} />
            <p>Nenhuma tarefa de onboarding atribuída a você.</p>
          </div>
        ) : (
          <>
            {onbPendentes.map(t => <CardSimples key={t._id} t={t} />)}
            {onbConcluidas.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Concluídas</p>
                {onbConcluidas.map(t => <CardSimples key={t._id} t={t} concluida />)}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── MINHAS TAREFAS (criadas por mim) ── */}
      <div style={styles.secao}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--borda)' }}>
          <h2 style={{ ...styles.secaoTitulo, margin: 0, border: 'none', padding: 0 }}>Minhas tarefas</h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--texto-apagado)', background: 'var(--input)', borderRadius: '20px', padding: '2px 8px', border: '1px solid var(--borda)' }}>
            {normaisPendentes.length} pendente(s)
          </span>
        </div>
        {normaisPendentes.length === 0 && normaisConcluidas.length === 0 ? (
          <div style={styles.vazio}>
            <Icone.CheckCircle size={32} style={{ color: 'var(--verde)', opacity: 0.4 }} />
            <p>Nenhuma tarefa ainda. Use o botão "+ Nova tarefa" para criar.</p>
          </div>
        ) : (
          <>
            {normaisPendentes.map(t => <CardSimples key={t._id} t={t} />)}
            {normaisConcluidas.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Concluídas</p>
                {normaisConcluidas.map(t => <CardSimples key={t._id} t={t} concluida />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PaginaInicio({ usuario, tarefas, setPagina }) {
  const [avisos, setAvisos] = useState([])
  const hoje = new Date().toISOString().split('T')[0]
  const h = new Date().getHours()
  const saudacao = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'

  const pendentes = tarefas.filter(t => t.status === 'pendente')
  const concluidas = tarefas.filter(t => t.status === 'concluida')
  const tarefasHoje = pendentes.filter(t => t.data === hoje)

  useEffect(() => {
    api.get('/mural').then(r => setAvisos(r.data.slice(0, 1))).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={styles.titulo}>{saudacao}, {usuario.nome.split(' ')[0]}!</h1>
        <p style={styles.subtitulo}>Veja o que tem pra hoje</p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <span style={styles.cardIcone}><Icone.ClipboardList size={22} /></span>
          <div>
            <p style={styles.cardNum}>{pendentes.length}</p>
            <p style={styles.cardLabel}>Pendentes</p>
          </div>
        </div>
        <div style={{ ...styles.card, borderColor: tarefasHoje.length > 0 ? 'rgba(245,158,11,0.3)' : undefined }}>
          <span style={{ ...styles.cardIcone, color: tarefasHoje.length > 0 ? '#F59E0B' : undefined }}><Icone.Calendar size={22} /></span>
          <div>
            <p style={styles.cardNum}>{tarefasHoje.length}</p>
            <p style={styles.cardLabel}>Para hoje</p>
          </div>
        </div>
        <div style={styles.card}>
          <span style={{ ...styles.cardIcone, color: 'var(--verde)' }}><Icone.CheckCircle size={22} /></span>
          <div>
            <p style={styles.cardNum}>{concluidas.length}</p>
            <p style={styles.cardLabel}>Concluídas</p>
          </div>
        </div>
      </div>

      <div style={styles.gridDois}>
        <div style={styles.secaoCard}>
          <div style={styles.secaoCardTopo}>
            <h2 style={styles.secaoTitulo}>Minhas tarefas de hoje</h2>
            <button style={styles.btnVer} onClick={() => setPagina('tarefas')}>Ver todas</button>
          </div>
          {tarefasHoje.length === 0 ? (
            <div style={styles.vazioCard}>
              <Icone.CheckCircle size={28} style={{ color: 'var(--borda)' }} />
              <p>Nenhuma tarefa para hoje!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tarefasHoje.slice(0, 5).map(t => (
                <div key={t._id} style={styles.linhaTarefa}>
                  <div style={styles.linhaTarefaPonto} />
                  <div style={{ flex: 1 }}>
                    <p style={styles.linhaTarefaDesc}>{t.descricao}</p>
                    {t.hora && <p style={styles.linhaTarefaMeta}>{t.hora}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.secaoCard}>
          <div style={styles.secaoCardTopo}>
            <h2 style={styles.secaoTitulo}>Mural de avisos</h2>
            <button style={styles.btnVer} onClick={() => setPagina('mural')}>Ver todos</button>
          </div>
          {avisos.length === 0 ? (
            <div style={styles.vazioCard}>
              <Icone.Bell size={28} style={{ color: 'var(--borda)' }} />
              <p>Nenhum aviso publicado</p>
            </div>
          ) : (
            avisos.map(a => (
              <div key={a._id} style={styles.linhaAviso}>
                {a.fixado && <span style={styles.badgeFixado}>Fixado</span>}
                <p style={styles.linhaAvisoTitulo}>{a.titulo}</p>
                <p style={styles.linhaAvisoTexto}>{a.texto.slice(0, 100)}{a.texto.length > 100 ? '...' : ''}</p>
                <p style={styles.linhaAvisoMeta}>{new Date(a.criadoEm).toLocaleDateString('pt-BR')}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardFuncionario() {
  const { usuario } = useAuth()
  const [pagina, setPagina] = useState('inicio')
  const [tarefas, setTarefas] = useState([])

  const carregarDados = async () => {
    try {
      const res = await api.get('/tarefas')
      setTarefas(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => { carregarDados() }, [])

  const menuItens = [
    { id: 'inicio', label: 'Início', icone: <Icone.Home size={16} /> },
    { id: 'tarefas', label: 'Minhas Tarefas', icone: <Icone.ClipboardList size={16} /> },
    { id: 'anotacoes', label: 'Anotações', icone: <Icone.Edit size={16} /> },
    { id: 'relatorios', label: 'Relatórios', icone: <Icone.BarChart size={16} /> },
    { id: 'mural', label: 'Mural', icone: <Icone.Bell size={16} /> },
  ]

  return (
    <Layout menuItens={menuItens} paginaAtual={pagina} setPagina={setPagina}>
      {pagina === 'inicio' && <PaginaInicio usuario={usuario} tarefas={tarefas} setPagina={setPagina} />}
      {pagina === 'tarefas' && <PaginaMinhasTarefas tarefas={tarefas} recarregar={carregarDados} />}
      {pagina === 'agenda' && <Agenda cargo="funcionario" usuarioAtualId={usuario?.id} />}
      {pagina === 'chat' && <Chat setPagina={setPagina} />}
      {pagina === 'anotacoes' && <Anotacoes />}
      {pagina === 'relatorios' && <Relatorios />}
      {pagina === 'mural' && <Mural />}
    </Layout>
  )
}

const styles = {
  gridDois: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' },
  secaoCard: { background: 'var(--sidebar)', border: '1px solid var(--borda)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  secaoCardTopo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btnVer: { background: 'none', border: 'none', color: 'var(--verde)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '600' },
  vazioCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px 0', color: 'var(--texto-apagado)', fontSize: '0.85rem' },
  linhaTarefa: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--borda)' },
  linhaTarefaPonto: { width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', flexShrink: 0, marginTop: '5px' },
  linhaTarefaDesc: { fontSize: '0.875rem', color: 'var(--texto)', margin: 0 },
  linhaTarefaMeta: { fontSize: '0.75rem', color: 'var(--texto-apagado)', margin: '2px 0 0' },
  linhaAviso: { padding: '12px', background: 'var(--input)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' },
  badgeFixado: { fontSize: '0.65rem', fontWeight: '700', color: 'var(--verde)', background: 'rgba(34,197,94,0.15)', padding: '2px 7px', borderRadius: '6px', width: 'fit-content' },
  linhaAvisoTitulo: { fontSize: '0.875rem', fontWeight: '600', color: 'var(--texto)', margin: 0 },
  linhaAvisoTexto: { fontSize: '0.8rem', color: 'var(--texto-apagado)', margin: 0, lineHeight: '1.4' },
  linhaAvisoMeta: { fontSize: '0.7rem', color: 'var(--texto-apagado)', margin: 0 },
  cabecalho: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  titulo: { fontSize: '1.8rem', color: 'var(--texto)', marginBottom: '4px' },
  subtitulo: { color: 'var(--texto-apagado)', fontSize: '0.9rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' },
  card: { background: 'var(--sidebar)', border: '1px solid var(--borda)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
  cardIcone: { color: 'var(--texto-apagado)', flexShrink: 0 },
  cardNum: { fontSize: '1.8rem', fontFamily: 'Inter, sans-serif', fontWeight: '700', color: 'var(--texto)', lineHeight: 1 },
  cardLabel: { fontSize: '0.8rem', color: 'var(--texto-apagado)', marginTop: '4px' },
  secao: { marginBottom: '32px' },
  secaoTitulo: { fontSize: '0.75rem', fontWeight: '600', color: 'var(--verde)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--borda)' },
  vazio: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '40px', color: 'var(--texto-apagado)', textAlign: 'center' },
  cardTarefa: { display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--sidebar)', border: '1px solid var(--borda)', borderRadius: '12px', padding: '16px 20px', marginBottom: '8px' },
  tarefaDesc: { fontSize: '1rem', color: 'var(--texto)', marginBottom: '4px' },
  tarefaMeta: { fontSize: '0.85rem', color: 'var(--texto-apagado)' },
  btnVerde: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.15)', color: 'var(--verde)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' },
  linhaResumo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--input)' },
  bolinha: { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--borda)', flexShrink: 0 },
  linhaDesc: { flex: 1, color: 'var(--texto)', fontSize: '0.9rem' },
  linhaData: { color: 'var(--texto-apagado)', fontSize: '0.8rem' },
}
