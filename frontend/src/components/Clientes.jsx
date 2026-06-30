import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api'
import { useToast } from './Toast'

const PERIODICIDADES = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
  { value: 'esporadico', label: 'Esporádico' },
]
const labelPeriodicidade = (v) => PERIODICIDADES.find(p => p.value === v)?.label || v

const mascaraCNPJ = (v) => v.replace(/\D/g,'').slice(0,14)
  .replace(/^(\d{2})(\d)/,'$1.$2')
  .replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3')
  .replace(/\.(\d{3})(\d)/,'.$1/$2')
  .replace(/(\d{4})(\d)/,'$1-$2')

const mascaraCPF = (v) => v.replace(/\D/g,'').slice(0,11)
  .replace(/(\d{3})(\d)/,'$1.$2')
  .replace(/(\d{3})(\d)/,'$1.$2')
  .replace(/(\d{3})(\d{1,2})/,'$1-$2')

const mascaraCEP = (v) => v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2')
const mascaraTelefone = (v) => {
  const d = v.replace(/\D/g,'').slice(0,11)
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d)/,'($1) $2-$3')
  return d.replace(/(\d{2})(\d{5})(\d)/,'($1) $2-$3')
}
const mascaraCNAE = (v) => {
  const d = v.replace(/\D/g,'').slice(0,7)
  return d.replace(/(\d{4})(\d)(\d{2})/,'$1-$2/$3').replace(/(\d{4})(\d)/,'$1-$2')
}
const formatarHonorario = (v) => {
  const nums = v.replace(/\D/g,'')
  if (!nums) return ''
  const centavos = parseInt(nums, 10)
  return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const honorarioParaNumero = (v) => {
  const nums = v.replace(/\D/g,'')
  if (!nums) return ''
  return (parseInt(nums, 10) / 100).toFixed(2)
}

const REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'mei', label: 'MEI' },
  { value: 'outro', label: 'Outro' },
]
const PORTES = [
  { value: 'mei', label: 'MEI' },
  { value: 'me', label: 'ME' },
  { value: 'epp', label: 'EPP' },
  { value: 'grande', label: 'Grande' },
]
const ATIVIDADES = [
  { value: 'servico', label: 'Prestação de serviço' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servico_comercio', label: 'Serviço e Comércio' },
  { value: 'servico_industria', label: 'Serviço e Indústria' },
  { value: 'comercio_industria', label: 'Comércio e Indústria' },
  { value: 'todos', label: 'Serviço, Comércio e Indústria' },
]
const STATUS_OPTS = [
  { value: 'ativo', label: 'Ativo', cor: '#00b141', bg: 'rgba(0,177,65,0.12)' },
  { value: 'inativo', label: 'Inativo', cor: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  { value: 'encerramento', label: 'Em encerramento', cor: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
]
const CERTIDOES_TIPOS = [
  { value: 'federal', label: 'CND Federal' },
  { value: 'estadual', label: 'CND Estadual' },
  { value: 'municipal', label: 'CND Municipal' },
  { value: 'fgts', label: 'FGTS' },
  { value: 'trabalhista', label: 'Certidão Trabalhista' },
  { value: 'outro', label: 'Outro' },
]

const labelRegime = (v) => REGIMES.find(r => r.value === v)?.label || v
const labelPorte = (v) => PORTES.find(r => r.value === v)?.label || v
const statusInfo = (v) => STATUS_OPTS.find(s => s.value === v) || STATUS_OPTS[0]
const formatMoeda = (v) => v ? `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'
const formatData = (v) => v ? new Date(v).toLocaleDateString('pt-BR') : '—'
const isoData = (v) => v ? new Date(v).toISOString().split('T')[0] : ''

function InfoLinha({ label, valor }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--texto-apagado)', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '2px' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--texto)' }}>{valor}</span>
    </div>
  )
}

function FormCliente({ cliente, fechar, onSalvo }) {
  const { mostrar } = useToast()
  const [aba, setAba] = useState('basico')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [servicosCadastrados, setServicosCadastrados] = useState([])
  const [mostrarListaServicos, setMostrarListaServicos] = useState(false)

  useEffect(() => {
    api.get('/servicos').then(r => setServicosCadastrados(r.data)).catch(() => {})
  }, [])
  const [form, setForm] = useState({
    razaoSocial: cliente?.razaoSocial || '',
    nomeFantasia: cliente?.nomeFantasia || '',
    cnpj: cliente?.cnpj || '',
    porte: cliente?.porte || '',
    regime: cliente?.regime || '',
    atividade: cliente?.atividade || '',
    dataAbertura: isoData(cliente?.dataAbertura),
    cnaePrincipal: cliente?.cnaePrincipal || '',
    status: cliente?.status || 'ativo',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    endereco: { logradouro: cliente?.endereco?.logradouro||'', numero: cliente?.endereco?.numero||'', complemento: cliente?.endereco?.complemento||'', bairro: cliente?.endereco?.bairro||'', cidade: cliente?.endereco?.cidade||'', estado: cliente?.endereco?.estado||'', cep: cliente?.endereco?.cep||'' },
    socio: { nome: cliente?.socio?.nome||'', cpf: cliente?.socio?.cpf||'', telefone: cliente?.socio?.telefone||'', email: cliente?.socio?.email||'' },
    servicosContratados: cliente?.servicosContratados?.length
      ? cliente.servicosContratados.map(sv => ({ ...sv, dataInicio: isoData(sv.dataInicio) }))
      : [{ nome: '', dataInicio: '', honorarioMensal: '', diaVencimento: '', periodicidade: 'mensal' }],
    certidoes: cliente?.certidoes?.map(c => ({ ...c, vencimento: isoData(c.vencimento) })) || [],
    observacoes: cliente?.observacoes || '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setEnd = (k, v) => setForm(f => ({ ...f, endereco: { ...f.endereco, [k]: v } }))
  const setSocio = (k, v) => setForm(f => ({ ...f, socio: { ...f.socio, [k]: v } }))
  const setSv = (i, k, v) => setForm(f => ({ ...f, servicosContratados: f.servicosContratados.map((s,j) => j===i ? {...s,[k]:v} : s) }))
  const addSv = () => setForm(f => ({ ...f, servicosContratados: [...f.servicosContratados, { nome:'', dataInicio:'', honorarioMensal:'', diaVencimento:'', periodicidade:'mensal' }] }))
  const removeSv = (i) => setForm(f => ({ ...f, servicosContratados: f.servicosContratados.filter((_,j) => j!==i) }))
  const setCert = (i, k, v) => setForm(f => ({ ...f, certidoes: f.certidoes.map((c,j) => j===i ? {...c,[k]:v} : c) }))
  const addCert = () => setForm(f => ({ ...f, certidoes: [...f.certidoes, { tipo:'federal', vencimento:'', situacao:'regular' }] }))
  const removeCert = (i) => setForm(f => ({ ...f, certidoes: f.certidoes.filter((_,j) => j!==i) }))

  const usarServicoExistente = (sv) => {
    const honorarioNum = sv.honorarioPadrao ? Number(sv.honorarioPadrao) : 0
    // Salvar como decimal com 2 casas (ex: "1500.00") — o display vai converter pra "1.500,00"
    const honorario = honorarioNum > 0 ? honorarioNum.toFixed(2) : ''
    const novoSv = { nome: sv.nome, dataInicio: '', honorarioMensal: honorario, diaVencimento: '', periodicidade: sv.periodicidade || 'mensal' }
    const semVazios = form.servicosContratados.filter(s => s.nome.trim())
    setForm(f => ({ ...f, servicosContratados: [...semVazios, novoSv] }))
    setMostrarListaServicos(false)
  }

  const salvar = async () => {
    if (!form.razaoSocial.trim()) return setErro('Razão social é obrigatória.')
    if (!form.porte) return setErro('Porte é obrigatório.')
    if (!form.regime) return setErro('Regime tributário é obrigatório.')
    if (!form.servicosContratados.some(s => s.nome.trim())) return setErro('Informe ao menos um serviço contratado.')
    if (form.email && !form.email.includes('@')) return setErro('E-mail inválido.')
    setErro(''); setCarregando(true)
    try {
      if (cliente?._id) { await api.put(`/clientes/${cliente._id}`, form); mostrar('Cliente atualizado!', 'sucesso') }
      else { await api.post('/clientes', form); mostrar('Cliente cadastrado!', 'sucesso') }
      onSalvo(); fechar()
    } catch(e) { setErro(e.response?.data?.erro || 'Erro ao salvar.') }
    finally { setCarregando(false) }
  }

  const abas = ['basico','contato','socio','servicos','obs']
  const abaLabels = { basico:'Dados básicos', contato:'Contato', socio:'Sócio', servicos:'Serviços', obs:'Observações' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--texto)', margin: 0, letterSpacing: '-0.03em', fontFamily: 'Inter, sans-serif' }}>{cliente ? 'Editar cliente' : 'Novo cliente'}</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--texto-apagado)', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>{abaLabels[aba]}</p>
        </div>
        <button style={{ ...s.btnX, marginTop: '4px' }} onClick={fechar} title="Cancelar">✕</button>
      </div>

      {/* Abas no topo */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--borda)', gap: '4px', marginBottom: '28px', overflowX: 'auto', flexShrink: 0 }}>
        {abas.map(a => (
          <button key={a} onClick={() => setAba(a)} style={{ background:'none', border:'none', borderBottom:`2px solid ${aba===a?'var(--verde)':'transparent'}`, color: aba===a?'var(--verde)':'var(--texto-apagado)', padding:'10px 14px', fontFamily:'Inter,sans-serif', fontSize:'0.85rem', fontWeight: aba===a?'600':'400', cursor:'pointer', whiteSpace:'nowrap' }}>
            {abaLabels[a]}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
          {erro && <p style={s.erro}>{erro}</p>}
          {aba==='basico' && <>
            {/* Razão social — campo grande e destaque */}
            <div style={s.campo}>
              <label style={s.lbl}>Razão social *</label>
              <input style={{ ...s.inp, fontSize: '1.1rem', padding: '14px 16px' }} value={form.razaoSocial} onChange={e=>set('razaoSocial',e.target.value)} placeholder="Nome oficial da empresa" autoFocus />
            </div>
            {/* CNPJ + Nome fantasia + Data abertura */}
            <div style={{ display:'flex', gap:'16px', alignItems:'flex-start' }}>
              <div style={{ ...s.campo, flex: '0 0 200px' }}><label style={s.lbl}>CNPJ *</label><input style={{ ...s.inp, letterSpacing: '0.5px' }} value={form.cnpj} onChange={e=>set('cnpj',mascaraCNPJ(e.target.value))} placeholder="00.000.000/0000-00" /></div>
              <div style={{ ...s.campo, flex: 1 }}><label style={s.lbl}>Nome fantasia</label><input style={s.inp} value={form.nomeFantasia} onChange={e=>set('nomeFantasia',e.target.value)} placeholder="Como é conhecido" /></div>
              <div style={{ ...s.campo, flex: '0 0 160px' }}><label style={s.lbl}>Data de abertura</label><input style={s.inp} type="date" value={form.dataAbertura} onChange={e=>set('dataAbertura',e.target.value)} /></div>
            </div>
            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <div style={{ ...s.campo, flex: '1 1 140px' }}>
                <label style={s.lbl}>Porte *</label>
                <select style={s.inp} value={form.porte} onChange={e=>{
                  const p = e.target.value
                  set('porte', p)
                  if (p === 'mei') set('regime', 'mei')
                }}>
                  <option value="">Selecione</option>
                  {PORTES.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div style={{ ...s.campo, flex: '1 1 200px' }}>
                <label style={s.lbl}>Regime tributário *</label>
                {form.porte === 'mei' ? (
                  <div style={{ ...s.inp, color:'var(--texto-apagado)', background:'rgba(255,255,255,0.03)', display:'flex', alignItems:'center' }}>MEI</div>
                ) : (
                  <select style={s.inp} value={form.regime} onChange={e=>set('regime',e.target.value)}>
                    <option value="">Selecione</option>
                    {REGIMES.filter(r=>r.value!=='mei').map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                )}
              </div>
              <div style={{ ...s.campo, flex: '1 1 180px' }}>
                <label style={s.lbl}>Atividade principal</label>
                <select style={s.inp} value={form.atividade} onChange={e=>set('atividade',e.target.value)}>
                  <option value="">Selecione</option>
                  {ATIVIDADES.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>CNAE principal</label><input style={s.inp} value={form.cnaePrincipal} onChange={e=>set('cnaePrincipal',mascaraCNAE(e.target.value))} placeholder="Ex: 6920-6/01" /></div><div style={s.campo}><label style={s.lbl}>Status</label><select style={s.inp} value={form.status} onChange={e=>set('status',e.target.value)}>{STATUS_OPTS.map(st=><option key={st.value} value={st.value}>{st.label}</option>)}</select></div></div>
          </>}
          {aba==='contato' && <>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>Telefone</label><input style={s.inp} value={form.telefone} onChange={e=>set('telefone',mascaraTelefone(e.target.value))} placeholder="(31) 99999-9999" /></div><div style={s.campo}><label style={s.lbl}>E-mail</label><input style={s.inp} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="contato@empresa.com" onBlur={e=>{ if(e.target.value && !e.target.value.includes('@')) set('email','') }} /></div></div>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>CEP</label><input style={s.inp} value={form.endereco.cep} onChange={e=>setEnd('cep',mascaraCEP(e.target.value))} placeholder="00000-000" /></div><div style={s.campo}><label style={s.lbl}>Estado</label><input style={s.inp} value={form.endereco.estado} onChange={e=>setEnd('estado',e.target.value.toUpperCase().slice(0,2))} placeholder="MG" /></div></div>
            <div style={s.campo}><label style={s.lbl}>Logradouro</label><input style={s.inp} value={form.endereco.logradouro} onChange={e=>setEnd('logradouro',e.target.value)} placeholder="Rua, Avenida..." /></div>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>Número</label><input style={s.inp} value={form.endereco.numero} onChange={e=>setEnd('numero',e.target.value)} /></div><div style={s.campo}><label style={s.lbl}>Complemento</label><input style={s.inp} value={form.endereco.complemento} onChange={e=>setEnd('complemento',e.target.value)} /></div></div>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>Bairro</label><input style={s.inp} value={form.endereco.bairro} onChange={e=>setEnd('bairro',e.target.value)} /></div><div style={s.campo}><label style={s.lbl}>Cidade</label><input style={s.inp} value={form.endereco.cidade} onChange={e=>setEnd('cidade',e.target.value)} /></div></div>
          </>}
          {aba==='socio' && <>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>Nome do sócio</label><input style={s.inp} value={form.socio.nome} onChange={e=>setSocio('nome',e.target.value)} /></div><div style={s.campo}><label style={s.lbl}>CPF</label><input style={s.inp} value={form.socio.cpf} onChange={e=>setSocio('cpf',mascaraCPF(e.target.value))} placeholder="000.000.000-00" /></div></div>
            <div style={s.g2}><div style={s.campo}><label style={s.lbl}>Telefone</label><input style={s.inp} value={form.socio.telefone} onChange={e=>setSocio('telefone',e.target.value)} /></div><div style={s.campo}><label style={s.lbl}>E-mail</label><input style={s.inp} value={form.socio.email} onChange={e=>setSocio('email',e.target.value)} /></div></div>
          </>}
          {aba==='servicos' && <>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
              <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)', margin:0 }}>Ao menos um serviço é obrigatório.</p>
              {servicosCadastrados.length > 0 && (
                <div style={{ position:'relative' }}>
                  <button onClick={()=>setMostrarListaServicos(v=>!v)} style={{ background:'none', border:'1px solid var(--borda)', borderRadius:'8px', color:'var(--verde)', padding:'6px 12px', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.78rem', fontWeight:'600', display:'flex', alignItems:'center', gap:'6px' }}>
                    📋 Usar serviço existente ▾
                  </button>
                  {mostrarListaServicos && (
                    <div style={{ position:'absolute', right:0, top:'calc(100% + 6px)', background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.4)', zIndex:10, minWidth:'220px', overflow:'hidden' }}>
                      {servicosCadastrados.map(sv => (
                        <button key={sv._id} onClick={()=>usarServicoExistente(sv)} style={{ display:'flex', flexDirection:'column', width:'100%', padding:'10px 14px', background:'none', border:'none', borderBottom:'1px solid var(--borda)', cursor:'pointer', textAlign:'left', fontFamily:'Inter,sans-serif' }}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--input)'}
                          onMouseLeave={e=>e.currentTarget.style.background='none'}>
                          <span style={{ fontSize:'0.85rem', fontWeight:'600', color:'var(--texto)' }}>{sv.nome}</span>
                          <span style={{ fontSize:'0.72rem', color:'var(--texto-apagado)' }}>{labelPeriodicidade(sv.periodicidade)}{sv.honorarioPadrao > 0 ? ` · R$ ${Number(sv.honorarioPadrao).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {form.servicosContratados.map((sv,i) => (
              <div key={i} style={{ border:'1px solid var(--borda)', borderRadius:'12px', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:'600', color:'var(--texto)', margin:0 }}>Serviço {i+1}</p>
                  {form.servicosContratados.length > 1 && <button onClick={()=>removeSv(i)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:'12px' }}>Remover</button>}
                </div>
                <div style={s.campo}><label style={s.lbl}>Nome do serviço *</label><input style={s.inp} value={sv.nome} onChange={e=>setSv(i,'nome',e.target.value)} placeholder="Ex: Contabilidade, Fiscal, DP..." /></div>
                <div style={s.g2}>
                  <div style={s.campo}><label style={s.lbl}>Periodicidade</label><select style={s.inp} value={sv.periodicidade||'mensal'} onChange={e=>setSv(i,'periodicidade',e.target.value)}>{[{value:'mensal',label:'Mensal'},{value:'trimestral',label:'Trimestral'},{value:'semestral',label:'Semestral'},{value:'anual',label:'Anual'},{value:'esporadico',label:'Esporádico'}].map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
                  <div style={s.campo}><label style={s.lbl}>Honorário (R$)</label><input style={s.inp} value={(() => {
                      const v = sv.honorarioMensal;
                      if (!v && v !== 0) return '';
                      // Se vier como "1500.00" (do serviço existente), mostrar direto como moeda
                      const n = parseFloat(String(v).replace(',','.'));
                      if (isNaN(n)) return '';
                      return n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
                    })()} onChange={e=>{
                      // Input centavos: digita 10000 → salva 100.00
                      const nums = e.target.value.replace(/\D/g,'');
                      setSv(i, 'honorarioMensal', nums ? (parseInt(nums,10)/100).toFixed(2) : '');
                    }} placeholder="0,00" /></div>
                </div>
                <div style={s.g2}>
                  <div style={s.campo}><label style={s.lbl}>Data início</label><input style={s.inp} type="date" value={sv.dataInicio} onChange={e=>setSv(i,'dataInicio',e.target.value)} /></div>
                  <div style={s.campo}><label style={s.lbl}>Dia de vencimento</label><input style={s.inp} type="number" min="1" max="31" value={sv.diaVencimento} onChange={e=>setSv(i,'diaVencimento',e.target.value)} placeholder="Ex: 10" /></div>
                </div>
              </div>
            ))}
            <button onClick={addSv} style={{ background:'none', border:'1px dashed var(--borda)', borderRadius:'10px', color:'var(--texto-apagado)', padding:'10px', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.82rem' }}>+ Adicionar serviço</button>
          </>}
          {aba==='certidoes' && <>
            <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)' }}>Registre as certidões e seus vencimentos.</p>
            {form.certidoes.map((c,i) => (
              <div key={i} style={{ border:'1px solid var(--borda)', borderRadius:'12px', padding:'16px', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:'0.82rem', fontWeight:'600', color:'var(--texto)', margin:0 }}>Certidão {i+1}</p>
                  <button onClick={()=>removeCert(i)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:'12px' }}>Remover</button>
                </div>
                <div style={s.g2}><div style={s.campo}><label style={s.lbl}>Tipo</label><select style={s.inp} value={c.tipo} onChange={e=>setCert(i,'tipo',e.target.value)}>{CERTIDOES_TIPOS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></div><div style={s.campo}><label style={s.lbl}>Situação</label><select style={s.inp} value={c.situacao} onChange={e=>setCert(i,'situacao',e.target.value)}><option value="regular">Regular</option><option value="irregular">Irregular</option><option value="a_vencer">A vencer</option></select></div></div>
                <div style={s.campo}><label style={s.lbl}>Vencimento</label><input style={s.inp} type="date" value={c.vencimento} onChange={e=>setCert(i,'vencimento',e.target.value)} /></div>
              </div>
            ))}
            <button onClick={addCert} style={{ background:'none', border:'1px dashed var(--borda)', borderRadius:'10px', color:'var(--texto-apagado)', padding:'10px', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.82rem' }}>+ Adicionar certidão</button>
          </>}
          {aba==='obs' && (
            <div style={s.campo}><label style={s.lbl}>Observações internas</label><textarea style={{ ...s.inp, minHeight:'160px', resize:'vertical' }} value={form.observacoes} onChange={e=>set('observacoes',e.target.value)} placeholder="Notas internas, particularidades do cliente..." /></div>
          )}
      </div>

      {/* Rodapé */}
      {erro && <p style={{ ...s.erro, marginBottom: '8px' }}>{erro}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--borda)', flexShrink: 0 }}>
        <button style={s.btnCanc} onClick={fechar}>Cancelar</button>
        <button style={s.btnSalv} onClick={salvar} disabled={carregando}>{carregando ? 'Salvando...' : cliente ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
      </div>
    </div>
  )
}

function TelaDetalhe({ clienteId, voltar, onAtualizado }) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [confirmExcluir, setConfirmExcluir] = useState(false)
  const [aba, setAba] = useState('info')
  const { mostrar } = useToast()

  const buscar = async () => {
    setCarregando(true)
    try { const r = await api.get(`/clientes/${clienteId}`); setDados(r.data) }
    catch { mostrar('Erro ao carregar cliente.', 'erro') }
    finally { setCarregando(false) }
  }
  useEffect(() => { buscar() }, [clienteId])

  const excluir = async () => {
    try { await api.delete(`/clientes/${clienteId}`); mostrar('Cliente removido.', 'sucesso'); onAtualizado(); voltar() }
    catch { mostrar('Erro ao remover.', 'erro') }
  }

  if (carregando) return <p style={{ color:'var(--texto-apagado)' }}>Carregando...</p>
  if (!dados) return null

  // Compatibilidade com clientes antigos (campo nome -> razaoSocial)
  const nomeCliente = dados.razaoSocial || dados.nome || '—'

  const st = statusInfo(dados.status)
  const honorarioTotal = dados.servicosContratados?.reduce((a, sv) => a + (Number(sv.honorarioMensal)||0), 0)
  const abas = [
    { id:'info', label:'Informações' },
    { id:'servicos', label:'Serviços' },
    { id:'onboardings', label:'Onboardings' },
    { id:'obs', label:'Observações' },
  ]

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <button onClick={voltar} style={{ background:'none', border:'none', color:'var(--texto-apagado)', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.82rem', padding:'0 0 10px', display:'flex', alignItems:'center', gap:'6px' }}>← Voltar para clientes</button>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'var(--verde)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:'700', color:'#fff', flexShrink:0 }}>{nomeCliente.slice(0,2).toUpperCase()}</div>
            <div>
              <h1 style={{ fontSize:'1.4rem', fontWeight:'700', color:'var(--texto)', margin:0, letterSpacing:'-0.03em' }}>{nomeCliente}</h1>
              {dados.nomeFantasia && <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)', margin:'2px 0 0' }}>{dados.nomeFantasia}</p>}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontSize:'0.75rem', fontWeight:'600', padding:'4px 12px', borderRadius:'99px', background:st.bg, color:st.cor }}>{st.label}</span>
          <button onClick={()=>setEditando(true)} style={{ background:'none', border:'1px solid var(--borda)', borderRadius:'8px', color:'var(--texto-apagado)', padding:'7px 14px', fontFamily:'Inter,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Editar</button>
          <button onClick={()=>setConfirmExcluir(true)} style={{ background:'none', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'8px', color:'#f87171', padding:'7px 14px', fontFamily:'Inter,sans-serif', fontSize:'0.82rem', cursor:'pointer' }}>Remover</button>
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:'1px solid var(--borda)', marginBottom:'24px', gap:'4px', overflowX:'auto' }}>
        {abas.map(a => (
          <button key={a.id} onClick={()=>setAba(a.id)} style={{ background:'none', border:'none', borderBottom:`2px solid ${aba===a.id?'var(--verde)':'transparent'}`, color: aba===a.id?'var(--verde)':'var(--texto-apagado)', padding:'10px 16px', fontFamily:'Inter,sans-serif', fontSize:'0.85rem', fontWeight: aba===a.id?'600':'400', cursor:'pointer', whiteSpace:'nowrap' }}>{a.label}</button>
        ))}
      </div>

      {aba==='info' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' }}>
          <div style={s.secCard}><p style={s.secTit}>Dados básicos</p><InfoLinha label="CNPJ" valor={dados.cnpj||'—'} /><InfoLinha label="Porte" valor={labelPorte(dados.porte)} /><InfoLinha label="Regime" valor={labelRegime(dados.regime)} /><InfoLinha label="Abertura" valor={formatData(dados.dataAbertura)} /><InfoLinha label="CNAE" valor={dados.cnaePrincipal||'—'} /></div>
          <div style={s.secCard}><p style={s.secTit}>Contato</p><InfoLinha label="Telefone" valor={dados.telefone||'—'} /><InfoLinha label="E-mail" valor={dados.email||'—'} />{dados.endereco?.logradouro && <InfoLinha label="Endereço" valor={`${dados.endereco.logradouro}, ${dados.endereco.numero}${dados.endereco.complemento?` - ${dados.endereco.complemento}`:''}, ${dados.endereco.bairro}, ${dados.endereco.cidade}/${dados.endereco.estado}`} />}</div>
          {dados.socio?.nome && <div style={s.secCard}><p style={s.secTit}>Sócio / Responsável</p><InfoLinha label="Nome" valor={dados.socio.nome} /><InfoLinha label="CPF" valor={dados.socio.cpf||'—'} /><InfoLinha label="Telefone" valor={dados.socio.telefone||'—'} /><InfoLinha label="E-mail" valor={dados.socio.email||'—'} /></div>}
        </div>
      )}

      {aba==='servicos' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', background:'rgba(0,177,65,0.06)', border:'1px solid rgba(0,177,65,0.15)', borderRadius:'12px' }}>
            <p style={{ fontSize:'0.85rem', color:'var(--texto-apagado)', margin:0 }}>Total de honorários mensais</p>
            <p style={{ fontSize:'1.1rem', fontWeight:'700', color:'var(--verde)', margin:0 }}>{formatMoeda(honorarioTotal)}</p>
          </div>
          {dados.servicosContratados?.map((sv,i) => (
            <div key={i} style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'16px 20px' }}>
              <p style={{ fontWeight:'600', color:'var(--texto)', margin:'0 0 10px', fontSize:'0.95rem' }}>{sv.nome}</p>
              <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
                <InfoLinha label="Início" valor={formatData(sv.dataInicio)} />
                <InfoLinha label="Honorário" valor={formatMoeda(sv.honorarioMensal)} />
                <InfoLinha label="Vencimento" valor={sv.diaVencimento ? `Dia ${sv.diaVencimento}` : '—'} />
              </div>
            </div>
          ))}
          {!dados.servicosContratados?.length && <p style={{ color:'var(--texto-apagado)', fontSize:'0.875rem' }}>Nenhum serviço cadastrado.</p>}
        </div>
      )}

      {aba==='certidoes' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {dados.certidoes?.length ? dados.certidoes.map((c,i) => {
            const si = { regular:{cor:'#00b141',label:'Regular'}, irregular:{cor:'#f87171',label:'Irregular'}, a_vencer:{cor:'#fbbf24',label:'A vencer'} }[c.situacao] || {}
            return (
              <div key={i} style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
                <div><p style={{ fontWeight:'600', color:'var(--texto)', margin:'0 0 4px', fontSize:'0.9rem' }}>{CERTIDOES_TIPOS.find(t=>t.value===c.tipo)?.label||c.tipo}</p><p style={{ fontSize:'0.78rem', color:'var(--texto-apagado)', margin:0 }}>Vencimento: {formatData(c.vencimento)}</p></div>
                <span style={{ fontSize:'0.75rem', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', background:`${si.cor}18`, color:si.cor }}>{si.label}</span>
              </div>
            )
          }) : <p style={{ color:'var(--texto-apagado)', fontSize:'0.875rem' }}>Nenhuma certidão cadastrada.</p>}
        </div>
      )}

      {aba==='onboardings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {dados.onboardings?.length ? dados.onboardings.map(o => {
            const conc = o.etapas?.filter(e=>e.status==='concluida').length||0
            const tot = o.etapas?.length||0
            const pct = tot ? Math.round((conc/tot)*100) : 0
            return (
              <div key={o._id} style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'16px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                  <div><p style={{ fontWeight:'600', color:'var(--texto)', margin:'0 0 3px', fontSize:'0.9rem' }}>{o.modelo?.nome||'Modelo removido'}</p><p style={{ fontSize:'0.75rem', color:'var(--texto-apagado)', margin:0 }}>Criado em {formatData(o.criadoEm)}</p></div>
                  <span style={{ fontSize:'0.75rem', fontWeight:'600', padding:'3px 10px', borderRadius:'99px', background: o.status==='concluida'?'rgba(0,177,65,0.1)':'rgba(251,191,36,0.1)', color: o.status==='concluida'?'#00b141':'#fbbf24' }}>{o.status==='concluida'?'Concluído':'Em andamento'}</span>
                </div>
                <div style={{ height:'4px', borderRadius:'99px', background:'var(--borda)', overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:'var(--verde)', borderRadius:'99px' }} /></div>
                <p style={{ fontSize:'0.72rem', color:'var(--texto-apagado)', margin:'5px 0 0' }}>{pct}% concluído</p>
              </div>
            )
          }) : <p style={{ color:'var(--texto-apagado)', fontSize:'0.875rem' }}>Nenhum onboarding vinculado a este cliente.</p>}
        </div>
      )}

      {aba==='obs' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'20px' }}>
          {dados.observacoes ? <p style={{ fontSize:'0.875rem', color:'var(--texto)', lineHeight:'1.6', margin:0, whiteSpace:'pre-wrap' }}>{dados.observacoes}</p>
          : <p style={{ color:'var(--texto-apagado)', fontSize:'0.875rem' }}>Nenhuma observação cadastrada.</p>}
        </div>
      )}

      {editando && <FormCliente cliente={dados} fechar={()=>setEditando(false)} onSalvo={()=>{buscar();onAtualizado()}} />}
      {confirmExcluir && createPortal(
        <div style={s.overlay} onClick={()=>setConfirmExcluir(false)}>
          <div style={{ ...s.modal, maxWidth:'400px' }} onClick={e=>e.stopPropagation()}>
            <div style={s.modalTopo}><p style={s.modalTit}>Remover cliente</p><button style={s.btnX} onClick={()=>setConfirmExcluir(false)}>✕</button></div>
            <div style={{ padding:'20px 24px' }}>
              <p style={{ fontSize:'0.875rem', color:'var(--texto)', margin:'0 0 12px' }}>Tem certeza que deseja remover <strong>{nomeCliente}</strong>?</p>
              <p style={{ fontSize:'0.8rem', color:'#fbbf24', background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:'8px', padding:'10px 12px', margin:0 }}>⚠️ Esta ação não pode ser desfeita. Os onboardings vinculados não serão afetados.</p>
            </div>
            <div style={s.modalRodape}><button style={s.btnCanc} onClick={()=>setConfirmExcluir(false)}>Cancelar</button><button style={{ ...s.btnSalv, background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171' }} onClick={excluir}>Remover</button></div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function CardCliente({ cliente, onClick }) {
  const st = statusInfo(cliente.status)
  const honorarioTotal = cliente.servicosContratados?.reduce((a,sv) => a+(Number(sv.honorarioMensal)||0), 0)
  return (
    <div onClick={onClick} style={{ background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'14px', padding:'20px', cursor:'pointer', position:'relative', transition:'border-color 0.15s, transform 0.1s' }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(0,177,65,0.3)';e.currentTarget.style.transform='translateY(-1px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--borda)';e.currentTarget.style.transform='translateY(0)'}}>
      <div style={{ position:'absolute', top:'14px', right:'14px', width:'10px', height:'10px', borderRadius:'50%', background:st.cor, boxShadow:`0 0 6px ${st.cor}60` }} title={st.label} />
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:'var(--verde)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:'700', color:'#fff', flexShrink:0 }}>{(cliente.razaoSocial||cliente.nome||'??').slice(0,2).toUpperCase()}</div>
        <div style={{ minWidth:0 }}>
          <p style={{ fontWeight:'600', color:'var(--texto)', margin:0, fontSize:'0.9rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cliente.razaoSocial||cliente.nome||'—'}</p>
          <p style={{ fontSize:'0.72rem', color:'var(--texto-apagado)', margin:'2px 0 0' }}>{cliente.cnpj||'Sem CNPJ'}</p>
        </div>
      </div>
      <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
        {cliente.regime && <span style={{ fontSize:'0.68rem', fontWeight:'600', padding:'2px 8px', borderRadius:'5px', background:'var(--input)', color:'var(--texto-apagado)' }}>{labelRegime(cliente.regime)}</span>}
        {cliente.porte && <span style={{ fontSize:'0.68rem', fontWeight:'600', padding:'2px 8px', borderRadius:'5px', background:'var(--input)', color:'var(--texto-apagado)' }}>{labelPorte(cliente.porte).toUpperCase()}</span>}
      </div>
      <div style={{ borderTop:'1px solid var(--borda)', paddingTop:'12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'0.72rem', color:'var(--texto-apagado)' }}>Honorário mensal</span>
        <span style={{ fontSize:'0.9rem', fontWeight:'700', color: honorarioTotal?'var(--verde)':'var(--texto-apagado)' }}>{formatMoeda(honorarioTotal)}</span>
      </div>
    </div>
  )
}

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [detalheId, setDetalheId] = useState(null)
  const { mostrar } = useToast()

  const carregar = async () => {
    setCarregando(true)
    try { const r = await api.get('/clientes'); setClientes(r.data) }
    catch { mostrar('Erro ao carregar clientes.', 'erro') }
    finally { setCarregando(false) }
  }
  useEffect(() => { carregar() }, [])

  const filtrados = clientes.filter(c =>
    (c.razaoSocial||c.nome)?.toLowerCase().includes(busca.toLowerCase()) ||
    c.nomeFantasia?.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj?.includes(busca)
  )

  // Tela de detalhe
  if (detalheId) return <TelaDetalhe clienteId={detalheId} voltar={()=>setDetalheId(null)} onAtualizado={carregar} />

  // Formulário de novo/editar — substitui a tela atual
  if (formAberto) return <FormCliente fechar={()=>setFormAberto(false)} onSalvo={carregar} />

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:'700', color:'var(--texto)', margin:0, letterSpacing:'-0.03em' }}>Clientes</h1>
          <p style={{ fontSize:'0.82rem', color:'var(--texto-apagado)', marginTop:'5px' }}>{clientes.length} cliente(s) cadastrado(s)</p>
        </div>
        <button onClick={()=>setFormAberto(true)} style={{ background:'var(--gradiente-verde)', color:'#fff', border:'none', borderRadius:'10px', padding:'10px 20px', fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'0.875rem', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,177,65,0.25)' }}>+ Novo cliente</button>
      </div>
      <input style={{ ...s.inp, marginBottom:'20px' }} value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome, nome fantasia ou CNPJ..." />
      {carregando ? <p style={{ color:'var(--texto-apagado)' }}>Carregando...</p>
      : filtrados.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--texto-apagado)' }}>
          {busca ? <p>Nenhum cliente encontrado para "{busca}".</p> : <>
            <p style={{ marginBottom:'12px', fontSize:'0.9rem' }}>Nenhum cliente cadastrado ainda.</p>
            <button onClick={()=>setFormAberto(true)} style={{ background:'var(--gradiente-verde)', color:'#fff', border:'none', borderRadius:'10px', padding:'10px 20px', fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'0.875rem', cursor:'pointer' }}>Cadastrar primeiro cliente</button>
          </>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:'14px' }}>
          {filtrados.map(c => <CardCliente key={c._id} cliente={c} onClick={()=>setDetalheId(c._id)} />)}
        </div>
      )}
    </div>
  )
}

const s = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' },
  modal: { background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'16px', width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', maxHeight:'90vh' },
  modalTopo: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid var(--borda)', flexShrink:0 },
  modalTit: { fontWeight:'700', fontSize:'1rem', color:'var(--texto)', fontFamily:'Inter,sans-serif', margin:0 },
  modalRodape: { display:'flex', gap:'12px', justifyContent:'flex-end', padding:'16px 24px', borderTop:'1px solid var(--borda)', flexShrink:0 },
  btnX: { background:'none', border:'1px solid var(--borda)', borderRadius:'6px', color:'var(--texto-apagado)', width:'28px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', cursor:'pointer' },
  btnCanc: { background:'none', border:'1px solid var(--borda)', borderRadius:'10px', color:'var(--texto-apagado)', padding:'10px 20px', fontFamily:'Inter,sans-serif', fontWeight:'500', fontSize:'0.875rem', cursor:'pointer' },
  btnSalv: { background:'var(--gradiente-verde)', color:'#fff', border:'none', borderRadius:'10px', padding:'10px 20px', fontFamily:'Inter,sans-serif', fontWeight:'600', fontSize:'0.875rem', cursor:'pointer' },
  g2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' },
  campo: { display:'flex', flexDirection:'column', gap:'6px' },
  lbl: { fontSize:'0.7rem', fontWeight:'600', color:'var(--texto-apagado)', textTransform:'uppercase', letterSpacing:'1px', fontFamily:'Inter,sans-serif' },
  inp: { background:'var(--input)', border:'1px solid var(--borda)', borderRadius:'10px', padding:'10px 14px', color:'var(--texto)', fontSize:'0.9rem', fontFamily:'Inter,sans-serif', width:'100%', boxSizing:'border-box' },
  erro: { color:'#FCA5A5', fontSize:'0.8rem', background:'rgba(239,68,68,0.1)', padding:'8px 12px', borderRadius:'8px' },
  secCard: { background:'var(--card)', border:'1px solid var(--borda)', borderRadius:'12px', padding:'18px 20px' },
  secTit: { fontSize:'0.75rem', fontWeight:'700', color:'var(--texto-apagado)', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 14px', fontFamily:'Inter,sans-serif' },
}
