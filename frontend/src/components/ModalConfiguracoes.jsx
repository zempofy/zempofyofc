import { usePreferencias } from '../contexts/PreferenciasContext'
import Modal from './Modal'

export default function ModalConfiguracoes({ fechar }) {
  const { tema, setTema, fonte, setFonte } = usePreferencias()

  return (
    <Modal onFechar={fechar} maxWidth="480px">
      <div style={styles.topo}>
        <span style={styles.titulo}>Configurações</span>
        <button style={styles.btnX} onClick={fechar}>✕</button>
      </div>

      <div style={styles.corpo}>
        {/* TEMA */}
        <div style={styles.secao}>
          <p style={styles.secaoTitulo}>Aparência</p>
          <div style={styles.temaOpcoes}>
            <button
              style={{ ...styles.temaBotao, ...(tema === 'escuro' ? styles.temaBotaoAtivo : {}) }}
              onClick={() => setTema('escuro')}
            >
              <div style={styles.temaPreview}>
                <div style={{ ...styles.temaPreviewSidebar, background: 'var(--sidebar)' }} />
                <div style={{ ...styles.temaPreviewConteudo, background: 'var(--fundo)' }}>
                  <div style={{ width: '60%', height: '6px', background: 'var(--borda)', borderRadius: '3px', marginBottom: '4px' }} />
                  <div style={{ width: '40%', height: '6px', background: 'var(--input)', borderRadius: '3px' }} />
                </div>
              </div>
              <span style={styles.temaLabel}>Escuro</span>
              {tema === 'escuro' && <span style={styles.temaCheck}>✓</span>}
            </button>

            <button
              style={{ ...styles.temaBotao, ...(tema === 'claro' ? styles.temaBotaoAtivo : {}) }}
              onClick={() => setTema('claro')}
            >
              <div style={styles.temaPreview}>
                <div style={{ ...styles.temaPreviewSidebar, background: '#ffffff' }} />
                <div style={{ ...styles.temaPreviewConteudo, background: '#F0FAF4' }}>
                  <div style={{ width: '60%', height: '6px', background: '#D1EAD9', borderRadius: '3px', marginBottom: '4px' }} />
                  <div style={{ width: '40%', height: '6px', background: '#EAF5EE', borderRadius: '3px' }} />
                </div>
              </div>
              <span style={{ ...styles.temaLabel, color: tema === 'claro' ? '#0F3D22' : undefined }}>Claro</span>
              {tema === 'claro' && <span style={{ ...styles.temaCheck, color: '#16A34A' }}>✓</span>}
            </button>
          </div>
        </div>

        {/* FONTE */}
        <div style={styles.secao}>
          <p style={styles.secaoTitulo}>Tamanho da fonte</p>
          <div style={styles.sliderWrapper}>
            <span style={styles.sliderLabel}>A</span>
            <div style={styles.sliderTrack}>
              <div style={styles.sliderLinha} />
              {[0, 1, 2].map(val => (
                <button
                  key={val}
                  style={{
                    ...styles.sliderPonto,
                    left: `${val * 50}%`,
                    background: fonte >= val ? 'var(--verde)' : 'var(--borda)',
                    transform: fonte === val ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)',
                    border: fonte === val ? '2px solid #22C55E' : '2px solid var(--borda)',
                  }}
                  onClick={() => setFonte(val)}
                />
              ))}
              <div style={{ ...styles.sliderLinhaAtiva, width: `${fonte * 50}%` }} />
            </div>
            <span style={{ ...styles.sliderLabel, fontSize: '1.3rem' }}>A</span>
          </div>
          <div style={styles.sliderLabels}>
            <span style={{ ...styles.sliderOpcaoLabel, color: fonte === 0 ? 'var(--verde)' : 'var(--texto-apagado)' }}>Pequena</span>
            <span style={{ ...styles.sliderOpcaoLabel, color: fonte === 1 ? 'var(--verde)' : 'var(--texto-apagado)' }}>Padrão</span>
            <span style={{ ...styles.sliderOpcaoLabel, color: fonte === 2 ? 'var(--verde)' : 'var(--texto-apagado)' }}>Grande</span>
          </div>
          <div style={styles.fontePreview}>
            <p style={{ fontSize: fonte === 0 ? '0.875rem' : fonte === 1 ? '1rem' : '1.125rem', color: 'var(--texto)', margin: 0, transition: 'font-size 0.2s' }}>
              Zempofy — Sistema de gestão de tarefas
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const styles = {
  topo: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--borda)' },
  titulo: { fontFamily: 'Inter, sans-serif', fontWeight: '700', fontSize: '1rem', color: 'var(--texto)' },
  btnX: { background: 'none', border: '1px solid var(--borda)', borderRadius: '6px', color: 'var(--texto-apagado)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer' },
  corpo: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '28px' },
  secao: { display: 'flex', flexDirection: 'column', gap: '14px' },
  secaoTitulo: { fontSize: '0.7rem', fontWeight: '700', color: 'var(--verde)', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 },
  temaOpcoes: { display: 'flex', gap: '12px' },
  temaBotao: { flex: 1, background: 'var(--input)', border: '2px solid var(--borda)', borderRadius: '12px', padding: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', position: 'relative' },
  temaBotaoAtivo: { borderColor: 'var(--verde)', background: 'rgba(34,197,94,0.08)' },
  temaPreview: { width: '100%', height: '60px', borderRadius: '6px', overflow: 'hidden', display: 'flex', border: '1px solid var(--borda)' },
  temaPreviewSidebar: { width: '25%' },
  temaPreviewConteudo: { flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  temaLabel: { fontSize: '0.8rem', fontWeight: '600', color: 'var(--texto)', fontFamily: 'Inter, sans-serif' },
  temaCheck: { position: 'absolute', top: '8px', right: '8px', color: 'var(--verde)', fontSize: '12px', fontWeight: '700' },
  sliderWrapper: { display: 'flex', alignItems: 'center', gap: '12px' },
  sliderLabel: { fontSize: '0.875rem', fontWeight: '700', color: 'var(--texto-apagado)', fontFamily: 'Inter, sans-serif', flexShrink: 0 },
  sliderTrack: { flex: 1, position: 'relative', height: '20px', display: 'flex', alignItems: 'center' },
  sliderLinha: { position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--borda)', borderRadius: '2px' },
  sliderLinhaAtiva: { position: 'absolute', left: 0, height: '2px', background: 'var(--verde)', borderRadius: '2px', transition: 'width 0.2s' },
  sliderPonto: { position: 'absolute', width: '14px', height: '14px', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s', zIndex: 1 },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', marginTop: '-8px' },
  sliderOpcaoLabel: { fontSize: '0.72rem', fontFamily: 'Inter, sans-serif', transition: 'color 0.2s' },
  fontePreview: { background: 'var(--input)', border: '1px solid var(--borda)', borderRadius: '10px', padding: '14px 16px', marginTop: '4px' },
}
