const mongoose = require('mongoose');

const servicoSchema = new mongoose.Schema({
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nome: { type: String, required: true, trim: true },
  descricao: { type: String, default: '', trim: true },
  honorarioPadrao: { type: Number, default: 0 },
  periodicidade: { type: String, enum: ['mensal', 'trimestral', 'semestral', 'anual', 'esporadico'], default: 'mensal' },
  // Mês de referência (1-12) — usado para trimestral e anual
  mesReferencia: { type: Number, default: null, min: 1, max: 12 },
  criadoEm: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Servico', servicoSchema);
