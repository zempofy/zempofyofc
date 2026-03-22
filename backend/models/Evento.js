const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, default: '' },
  data: { type: String, required: true }, // formato YYYY-MM-DD
  horaInicio: { type: String, default: '' },
  horaFim: { type: String, default: '' },
  cor: { type: String, default: '#2196F3' },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
  criadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evento', eventoSchema);
