const express = require('express');
const router = express.Router();
const Empresa = require('../models/Empresa');
const Usuario = require('../models/Usuario');
const Implantacao = require('../models/Implantacao');

// Middleware — verifica a chave secreta
const verificarChave = (req, res, next) => {
  const chave = req.headers['x-admin-key'];
  if (!chave || chave !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ erro: 'Acesso negado.' });
  }
  next();
};

// GET /api/painel — retorna todos os dados do painel
router.get('/', verificarChave, async (req, res) => {
  try {
    const empresas = await Empresa.find().sort({ criadaEm: -1 });

    const dados = await Promise.all(empresas.map(async (emp) => {
      const usuarios = await Usuario.find({ empresa: emp._id, ativo: true });
      const titular = usuarios.find(u => u.cargo === 'admin');
      const implantacoes = await Implantacao.find({
        empresa: emp._id,
        status: { $ne: 'cancelada' }
      });
      const implantacoesAtivas = implantacoes.filter(i => i.status !== 'concluida');
      const implantacoesConcluidas = implantacoes.filter(i => i.status === 'concluida');
      const ultimoAcesso = usuarios
        .map(u => u.ultimoAcesso)
        .filter(Boolean)
        .sort((a, b) => new Date(b) - new Date(a))[0];

      return {
        id: emp._id,
        nome: emp.nome,
        cnpj: emp.cnpj,
        plano: emp.plano,
        ativa: emp.ativa,
        criadaEm: emp.criadaEm,
        titular: titular ? { nome: titular.nome, email: titular.email } : null,
        totalUsuarios: usuarios.length,
        implantacoesAtivas: implantacoesAtivas.length,
        implantacoesConcluidas: implantacoesConcluidas.length,
        ultimoAcesso: ultimoAcesso || null,
      };
    }));

    res.json({
      totalEmpresas: empresas.length,
      empresasAtivas: empresas.filter(e => e.ativa).length,
      geradoEm: new Date(),
      empresas: dados,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar dados do painel.' });
  }
});

module.exports = router;
