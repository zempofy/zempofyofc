const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  tipo: {
    type: String,
    enum: [
      'implantacao_criada', 'implantacao_excluida', 'implantacao_etapa_concluida',
      'modelo_criado', 'modelo_editado', 'modelo_excluido',
      'atividade_criada', 'atividade_editada', 'atividade_excluida',
      'cliente_criado', 'cliente_editado', 'cliente_excluido',
      'membro_adicionado', 'membro_removido',
      'tarefa_concluida',
    ],
    required: true,
  },
  categoria: {
    type: String,
    enum: ['onboarding', 'modelo', 'atividade', 'cliente', 'equipe', 'tarefa'],
    required: true,
  },
  descricao: { type: String, required: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  criadoEm: { type: Date, default: Date.now },
});

logSchema.index({ empresa: 1, criadoEm: -1 });

module.exports = mongoose.model('Log', logSchema);
