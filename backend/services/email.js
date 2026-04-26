const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Zempofy <noreply@zempofy.com.br>';
const VERDE = '#008f34';
const LOGO_BASE64 = 'data:image/png;base64,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';

const template = (titulo, corpo) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
  body { margin:0; padding:0; background:#09090b; font-family:'Segoe UI',Arial,sans-serif; }
  .wrap { max-width:580px; margin:32px auto; background:#18181b; border:1px solid #27272a; border-radius:16px; overflow:hidden; }
  .top { background:#18181b; border-bottom:1px solid #27272a; padding:24px 32px; display:flex; align-items:center; }
  .body { padding:32px; }
  .body h2 { color:#fafafa; font-size:1.1rem; margin:0 0 16px; font-weight:700; }
  .body p { color:#a1a1aa; font-size:0.88rem; line-height:1.7; margin:0 0 14px; }
  .body strong { color:#fafafa; }
  .card { background:#09090b; border:1px solid #27272a; border-radius:10px; padding:16px 20px; margin:20px 0; }
  .card p { margin:0 0 4px; color:#fafafa; font-size:0.95rem; font-weight:600; }
  .card span { color:#71717a; font-size:0.8rem; }
  .badge { display:inline-block; background:rgba(0,143,52,0.15); color:${VERDE}; border:1px solid rgba(0,143,52,0.3); border-radius:6px; padding:3px 10px; font-size:0.75rem; font-weight:600; margin-bottom:16px; }
  .btn { display:inline-block; background:${VERDE}; color:#fff !important; text-decoration:none; padding:12px 28px; border-radius:10px; font-weight:600; font-size:0.88rem; margin:8px 0; }
  .divider { border:none; border-top:1px solid #27272a; margin:24px 0; }
  .foot { padding:20px 32px; }
  .foot p { color:#3f3f46; font-size:0.72rem; margin:0; line-height:1.6; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <img src="${LOGO_BASE64}" alt="Zempofy" style="height:28px;width:auto;" />
    </div>
    <div class="body">
      <span class="badge">Zempofy</span>
      <h2>${titulo}</h2>
      ${corpo}
    </div>
    <div class="foot">
      <hr style="border:none;border-top:1px solid #27272a;margin-bottom:16px;" />
      <p>Este é um e-mail automático do sistema Zempofy. Por favor, não responda a este e-mail.<br>© 2026 Zempofy Software. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

const enviarOnboardingCriado = async ({ destinatarios, nomeCliente, criadoPor, empresa }) => {
  if (!destinatarios?.length) return;
  const corpo = `
    <p>Um novo processo de onboarding foi iniciado em <strong>${empresa}</strong>.</p>
    <div class="card">
      <p>${nomeCliente}</p>
      <span>Iniciado por ${criadoPor}</span>
    </div>
    <p>Você faz parte deste processo. Quando chegar a sua vez de agir, enviaremos um novo e-mail avisando. Fique atento!</p>
    <hr class="divider" />
    <a class="btn" href="https://app.zempofy.com.br">Acessar o sistema</a>
  `;
  try {
    await resend.emails.send({
      from: FROM,
      to: destinatarios,
      subject: `Novo onboarding: ${nomeCliente}`,
      html: template('Novo cliente chegou!', corpo),
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail onboarding criado:', err);
  }
};

const enviarEtapaDesbloqueada = async ({ destinatarios, nomeCliente, setor, empresa }) => {
  if (!destinatarios?.length) return;
  const corpo = `
    <p>Chegou a sua vez de agir no onboarding de <strong>${nomeCliente}</strong>${empresa ? ` em <strong>${empresa}</strong>` : ''}.</p>
    <div class="card">
      <p>Setor: ${setor}</p>
      <span>As atividades do seu setor estão liberadas e aguardando conclusão</span>
    </div>
    <p>Acesse o sistema, veja as tarefas atribuídas a você e conclua as atividades assim que possível.</p>
    <hr class="divider" />
    <a class="btn" href="https://app.zempofy.com.br">Ver minhas tarefas</a>
  `;
  try {
    await resend.emails.send({
      from: FROM,
      to: destinatarios,
      subject: `É a sua vez! Onboarding de ${nomeCliente}`,
      html: template('Chegou a sua vez!', corpo),
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail etapa desbloqueada:', err);
  }
};

const enviarTarefaAtribuida = async ({ destinatario, descricao, criadoPor, data, empresa }) => {
  if (!destinatario) return;
  const corpo = `
    <p><strong>${criadoPor}</strong> criou uma nova tarefa para você${empresa ? ` em <strong>${empresa}</strong>` : ''}.</p>
    <div class="card">
      <p>${descricao}</p>
      ${data ? `<span>Prazo: ${new Date(data).toLocaleDateString('pt-BR')}</span>` : '<span>Sem prazo definido</span>'}
    </div>
    <p>Acesse o sistema para ver os detalhes e marcar como concluída quando finalizar.</p>
    <hr class="divider" />
    <a class="btn" href="https://app.zempofy.com.br">Ver minha tarefa</a>
  `;
  try {
    await resend.emails.send({
      from: FROM,
      to: [destinatario],
      subject: `Nova tarefa: ${descricao.slice(0, 50)}${descricao.length > 50 ? '...' : ''}`,
      html: template('Você recebeu uma nova tarefa', corpo),
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail tarefa atribuída:', err);
  }
};

module.exports = { enviarOnboardingCriado, enviarEtapaDesbloqueada, enviarTarefaAtribuida };
