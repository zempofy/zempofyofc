const express = require('express');
const { autenticar } = require('../middleware/auth');
const Cliente = require('../models/Cliente');

const router = express.Router();

// GET /api/clientes
router.get('/', autenticar, async (req, res) => {
  try {
    const clientes = await Cliente.find({ empresa: req.usuario.empresa._id })
      .populate('criadoPor', 'nome')
      .sort({ criadoEm: -1 });
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar clientes.' });
  }
});

// POST /api/clientes
router.post('/', autenticar, async (req, res) => {
  const { nome, cnpj, regime, tipo, observacoes } = req.body;
  if (!nome?.trim()) return res.status(400).json({ erro: 'Nome é obrigatório.' });
  try {
    // Verifica CNPJ duplicado
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      const existe = await Cliente.findOne({ empresa: req.usuario.empresa._id, cnpj: { $regex: cnpjLimpo } });
      if (existe) return res.status(400).json({ erro: 'Já existe um cliente com esse CNPJ.' });
    }
    const cliente = await Cliente.create({
      nome: nome.trim(),
      cnpj: cnpj || '',
      regime: regime || '',
      tipo: tipo || '',
      observacoes: observacoes || '',
      empresa: req.usuario.empresa._id,
      criadoPor: req.usuario._id,
    });
    res.status(201).json(cliente);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar cliente.' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', autenticar, async (req, res) => {
  const { nome, cnpj, regime, tipo, observacoes } = req.body;
  try {
    const cliente = await Cliente.findOneAndUpdate(
      { _id: req.params.id, empresa: req.usuario.empresa._id },
      { nome: nome?.trim(), cnpj, regime, tipo, observacoes },
      { new: true }
    );
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado.' });
    res.json(cliente);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao editar cliente.' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    await Cliente.findOneAndDelete({ _id: req.params.id, empresa: req.usuario.empresa._id });
    res.json({ mensagem: 'Cliente removido.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao remover cliente.' });
  }
});

module.exports = router;
