const express = require('express');
const { autenticar } = require('../middleware/auth');
const Obrigacao = require('../models/Obrigacao');
const Cliente = require('../models/Cliente');
const Servico = require('../models/Servico');

const router = express.Router();

function servicoAtivoNoMes(servico, mes) {
  const p = servico.periodicidade;
  const ref = servico.mesReferencia;
  if (p === 'mensal') return true;
  if (p === 'trimestral' && ref) {
    const meses = [ref, ref+3, ref+6, ref+9].map(m => ((m-1)%12)+1);
    return meses.includes(mes);
  }
  if (p === 'anual' && ref) return mes === ref;
  return false;
}

// GET /api/obrigacoes?mes=6&ano=2026
router.get('/', autenticar, async (req, res) => {
  try {
    const mes = parseInt(req.query.mes) || new Date().getMonth() + 1;
    const ano = parseInt(req.query.ano) || new Date().getFullYear();
    const empresaId = req.usuario.empresa._id;

    // Buscar serviços da empresa (mensal, trimestral, anual)
    const servicos = await Servico.find({
      empresa: empresaId,
      periodicidade: { $in: ['mensal', 'trimestral', 'anual'] }
    }).lean();

    const servicosDoMes = servicos.filter(s => servicoAtivoNoMes(s, mes));
    if (!servicosDoMes.length) return res.json([]);

    // Buscar clientes ativos da empresa
    const nomesServicos = servicosDoMes.map(s => s.nome);
    const clientes = await Cliente.find({
      empresa: empresaId,
      status: 'ativo',
      'servicosContratados.nome': { $in: nomesServicos }
    }).select('razaoSocial nome cnpj servicosContratados').lean();

    // Buscar registros de obrigações existentes para esse mês/ano
    const servicoIds = servicosDoMes.map(s => s._id);
    const clienteIds = clientes.map(c => c._id);

    const registros = await Obrigacao.find({
      empresa: empresaId,
      mes,
      ano,
      servico: { $in: servicoIds },
      cliente: { $in: clienteIds }
    }).populate('feitoPor', 'nome').lean();

    // Montar resultado agrupado por serviço
    const resultado = servicosDoMes.map(servico => {
      const clientesDoServico = clientes.filter(c =>
        c.servicosContratados?.some(sv => sv.nome === servico.nome)
      );

      const itens = clientesDoServico.map(cliente => {
        const reg = registros.find(r =>
          r.cliente.toString() === cliente._id.toString() &&
          r.servico.toString() === servico._id.toString()
        );
        return {
          clienteId: cliente._id,
          nomeCliente: cliente.razaoSocial || cliente.nome || '—',
          cnpj: cliente.cnpj || '',
          feito: reg?.feito || false,
          feitoEm: reg?.feitoEm || null,
          feitoPor: reg?.feitoPor?.nome || null,
          observacao: reg?.observacao || '',
          obrigacaoId: reg?._id || null,
        };
      });

      return {
        servicoId: servico._id,
        nomeServico: servico.nome,
        periodicidade: servico.periodicidade,
        itens,
        total: itens.length,
        concluidos: itens.filter(i => i.feito).length,
      };
    });

    res.json(resultado);
  } catch (err) {
    console.error('ERRO OBRIGACOES:', err.message);
    res.status(500).json({ erro: 'Erro ao buscar obrigações.', detalhe: err.message });
  }
});

// POST /api/obrigacoes/marcar
router.post('/marcar', autenticar, async (req, res) => {
  try {
    const { clienteId, servicoId, mes, ano, feito, observacao } = req.body;
    const resultado = await Obrigacao.findOneAndUpdate(
      { empresa: req.usuario.empresa._id, cliente: clienteId, servico: servicoId, mes, ano },
      {
        feito,
        feitoEm: feito ? new Date() : null,
        feitoPor: feito ? req.usuario._id : null,
        observacao: observacao ?? '',
      },
      { upsert: true, new: true }
    );
    res.json(resultado);
  } catch (err) {
    console.error('ERRO MARCAR:', err.message);
    res.status(500).json({ erro: 'Erro ao salvar obrigação.' });
  }
});

// PATCH /api/obrigacoes/observacao
router.patch('/observacao', autenticar, async (req, res) => {
  try {
    const { clienteId, servicoId, mes, ano, observacao } = req.body;
    await Obrigacao.findOneAndUpdate(
      { empresa: req.usuario.empresa._id, cliente: clienteId, servico: servicoId, mes, ano },
      { observacao },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar observação.' });
  }
});

module.exports = router;
