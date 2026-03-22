const mongoose = require('mongoose');

const anotacaoSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  texto: { type: String, default: '' },
  cor: { type: String, default: '#1E2820' },
  fixada: { type: Boolean, default: false },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  criadaEm: { type: Date, default: Date.now },
  atualizadaEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Anotacao', anotacaoSchema);
