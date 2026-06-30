const mongoose = require('mongoose');

// Registra o status de cada obrigação por empresa/serviço/mês
const obrigacaoSchema = new mongoose.Schema({
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  servico: { type: mongoose.Schema.Types.ObjectId, ref: 'Servico', required: true },
  mes: { type: Number, required: true, min: 1, max: 12 }, // 1-12
  ano: { type: Number, required: true },
  feito: { type: Boolean, default: false },
  feitoEm: { type: Date, default: null },
  feitoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  observacao: { type: String, default: '' },
});

// Índice único — um registro por cliente/serviço/mês/ano
obrigacaoSchema.index({ empresa: 1, cliente: 1, servico: 1, mes: 1, ano: 1 }, { unique: true });

module.exports = mongoose.model('Obrigacao', obrigacaoSchema);
