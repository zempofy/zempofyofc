const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const autenticar = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Faça login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).populate('empresa');

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou inativo.' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }
};

// Só o dono (admin)
const apenasAdmin = (req, res, next) => {
  if (req.usuario.cargo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso permitido apenas para o dono da conta.' });
  }
  next();
};

// Admin ou Administrador (gerente)
const apenasGestores = (req, res, next) => {
  if (!['admin', 'administrador'].includes(req.usuario.cargo)) {
    return res.status(403).json({ erro: 'Acesso permitido apenas para gestores.' });
  }
  next();
};

// Verifica se é colaborador (acesso mais restrito)
const isColaborador = (usuario) => usuario.cargo === 'colaborador';
const isGestor = (usuario) => ['admin', 'administrador'].includes(usuario.cargo);
const isDono = (usuario) => usuario.cargo === 'admin';

module.exports = { autenticar, apenasAdmin, apenasGestores, isColaborador, isGestor, isDono };
