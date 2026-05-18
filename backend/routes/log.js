const express = require('express');
const { autenticar, apenasAdmin } = require('../middleware/auth');
const Log = require('../models/Log');

const router = express.Router();

// GET /api/logs — busca histórico da empresa
router.get('/', autenticar, async (req, res) => {
  try {
    const { categoria, limite = 100 } = req.query;
    const filtro = { empresa: req.usuario.empresa._id };
    if (categoria && categoria !== 'todos') {
      // Suporte a múltiplas categorias: ?categoria=onboarding&categoria=modelo
      const cats = Array.isArray(categoria) ? categoria : [categoria];
      filtro.categoria = { $in: cats };
    }

    const logs = await Log.find(filtro)
      .populate('usuario', 'nome avatar')
      .sort({ criadoEm: -1 })
      .limit(Number(limite));

    res.json(logs);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
});

module.exports = router;
