const mongoose = require('mongoose');

const atividadeChecklistSchema = new mongoose.Schema({
  descricao: { type: String, required: true, trim: true },
  observacoes: { type: String, default: '' },
  setor: { type: mongoose.Schema.Types.ObjectId, ref: 'Setor', required: true },
  responsavel: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  ativo: { type: Boolean, default: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AtividadeChecklist', atividadeChecklistSchema);
