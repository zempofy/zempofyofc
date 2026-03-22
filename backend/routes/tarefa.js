const express = require('express');
const { autenticar } = require('../middleware/auth');
const Tarefa = require('../models/Tarefa');

const router = express.Router();

const populateTarefa = (q) => q
  .populate('responsavel', 'nome email avatar')
  .populate('criadaPor', 'nome')
  .populate('concluidaPor', 'nome');

// GET /api/tarefas
router.get('/', autenticar, async (req, res) => {
  try {
    const filtro = { empresa: req.usuario.empresa._id, tarefaMae: null };
    if (req.usuario.cargo === 'colaborador') filtro.responsavel = req.usuario._id;
    const tarefas = await populateTarefa(Tarefa.find(filtro)).sort({ criadaEm: -1 });
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas.' });
  }
});

// GET /api/tarefas/:id/subtarefas
router.get('/:id/subtarefas', autenticar, async (req, res) => {
  try {
    const subtarefas = await populateTarefa(
      Tarefa.find({ tarefaMae: req.params.id, empresa: req.usuario.empresa._id })
    ).sort({ criadaEm: 1 });
    res.json(subtarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar subtarefas.' });
  }
});

// GET /api/tarefas/historico - Tarefas concluídas (registro de conquistas)
router.get('/historico/conquistas', autenticar, async (req, res) => {
  try {
    const filtro = {
      empresa: req.usuario.empresa._id,
      status: 'concluida',
    };
    if (req.usuario.cargo === 'colaborador') filtro.responsavel = req.usuario._id;
    const tarefas = await populateTarefa(Tarefa.find(filtro)).sort({ concluidaEm: -1 }).limit(100);
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar histórico.' });
  }
});

// POST /api/tarefas
router.post('/', autenticar, async (req, res) => {
  const { descricao, data, hora, local, cor, responsavelId, etiquetas, prioridade, tarefaMaeId } = req.body;
  if (!descricao) return res.status(400).json({ erro: 'Descrição é obrigatória.' });
  try {
    const responsavel = ['admin', 'administrador'].includes(req.usuario.cargo) && responsavelId
      ? responsavelId : req.usuario._id;
    const tarefa = await Tarefa.create({
      descricao, data, hora, local, cor,
      etiquetas: etiquetas || [],
      prioridade: prioridade || '',
      tarefaMae: tarefaMaeId || null,
      responsavel,
      criadaPor: req.usuario._id,
      empresa: req.usuario.empresa._id
    });
    const populada = await populateTarefa(Tarefa.findById(tarefa._id));
    res.status(201).json(populada);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar tarefa.' });
  }
});

// PUT /api/tarefas/:id
router.put('/:id', autenticar, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, empresa: req.usuario.empresa._id };
    if (req.usuario.cargo === 'colaborador') filtro.responsavel = req.usuario._id;
    const tarefa = await populateTarefa(
      Tarefa.findOneAndUpdate(filtro, req.body, { new: true })
    );
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao editar tarefa.' });
  }
});

// PATCH /api/tarefas/:id/etiquetas
router.patch('/:id/etiquetas', autenticar, async (req, res) => {
  try {
    const tarefa = await populateTarefa(
      Tarefa.findOneAndUpdate(
        { _id: req.params.id, empresa: req.usuario.empresa._id },
        { etiquetas: req.body.etiquetas || [] },
        { new: true }
      )
    );
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar etiquetas.' });
  }
});

// PATCH /api/tarefas/:id/prioridade
router.patch('/:id/prioridade', autenticar, async (req, res) => {
  try {
    const tarefa = await populateTarefa(
      Tarefa.findOneAndUpdate(
        { _id: req.params.id, empresa: req.usuario.empresa._id },
        { prioridade: req.body.prioridade || '' },
        { new: true }
      )
    );
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar prioridade.' });
  }
});

// PATCH /api/tarefas/:id/concluir
router.patch('/:id/concluir', autenticar, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, empresa: req.usuario.empresa._id };
    if (req.usuario.cargo === 'colaborador') filtro.responsavel = req.usuario._id;
    const tarefa = await Tarefa.findOneAndUpdate(filtro,
      { status: 'concluida', concluidaEm: new Date(), concluidaPor: req.usuario._id },
      { new: true });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao concluir tarefa.' });
  }
});

// PATCH /api/tarefas/:id/desmarcar
router.patch('/:id/desmarcar', autenticar, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, empresa: req.usuario.empresa._id };
    if (req.usuario.cargo === 'colaborador') filtro.responsavel = req.usuario._id;
    const tarefa = await Tarefa.findOneAndUpdate(filtro,
      { status: 'pendente', $unset: { concluidaEm: '', concluidaPor: '' } },
      { new: true });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao desmarcar tarefa.' });
  }
});

// DELETE /api/tarefas/:id
router.delete('/:id', autenticar, async (req, res) => {
  try {
    const filtro = { _id: req.params.id, empresa: req.usuario.empresa._id };
    if (req.usuario.cargo === 'colaborador') filtro.responsavel = req.usuario._id;
    // Remove também subtarefas
    await Tarefa.deleteMany({ tarefaMae: req.params.id, empresa: req.usuario.empresa._id });
    await Tarefa.findOneAndDelete(filtro);
    res.json({ mensagem: 'Tarefa excluída.' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir tarefa.' });
  }
});

module.exports = router;
