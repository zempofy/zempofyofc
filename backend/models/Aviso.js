const mongoose = require('mongoose');

const avisoSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  texto: { type: String, required: true },
  imagem: { type: String, default: '' }, // base64 ou URL
  fixado: { type: Boolean, default: false },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  reacoes: [{
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    emoji: { type: String }
  }],
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Aviso', avisoSchema);
