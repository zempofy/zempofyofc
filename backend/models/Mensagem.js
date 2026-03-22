const mongoose = require('mongoose');

const mensagemSchema = new mongoose.Schema({
  de: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  para: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  texto: { type: String, required: true, trim: true },
  lida: { type: Boolean, default: false },
  apagada: { type: Boolean, default: false },
  criadaEm: { type: Date, default: Date.now }
});

// Índice para buscar conversas rapidamente
mensagemSchema.index({ empresa: 1, de: 1, para: 1, criadaEm: -1 });

module.exports = mongoose.model('Mensagem', mensagemSchema);
