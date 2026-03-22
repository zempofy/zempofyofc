const express = require('express');
const { autenticar, apenasAdmin } = require('../middleware/auth');
const Empresa = require('../models/Empresa');

const router = express.Router();

// GET /api/empresa - Dados da empresa do usuário logado
router.get('/', autenticar, async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.usuario.empresa._id);
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar empresa.' });
  }
});

// PUT /api/empresa - Atualizar nome da empresa (só admin)
router.put('/', autenticar, apenasAdmin, async (req, res) => {
  const { nome } = req.body;
  try {
    const empresa = await Empresa.findByIdAndUpdate(
      req.usuario.empresa._id,
      { nome },
      { new: true }
    );
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar empresa.' });
  }
});

module.exports = router;
