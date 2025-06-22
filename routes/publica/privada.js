import express from 'express'; // OK
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../../middlewares/isAdmin.js';
import auth from '../../middlewares/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
// GET perfil do usuário autenticado
router.get('/usuario', auth, async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.userID },
      select: { nome: true, email: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.status(200).json({ message: 'Usuário encontrado', usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Falha no servidor' });
  }
});

// GET quizzes públicos 
router.get('/quizzes-publico',auth, async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      include: {
        questions: {
          include: { answers: true }
        }
      }
    });
    console.log(quizzes)
    res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quizzes para usuários' });
  }
});

router.get('/quizzes-public/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }

    res.status(200).json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quiz' });
  }
});


// POST criar quiz (somente admin)
router.post('/quizzes', auth, isAdmin, async (req, res) => {
  const { titulo } = req.body;
  if (!titulo) {
    return res.status(400).json({ error: 'O título é obrigatório' });
  }
  try {
    const quiz = await prisma.quizzes.create({
      data: {
        titulo,
        criado_por: req.userID
      }
    });
    res.status(201).json({ message: 'Quiz criado com sucesso', quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar quiz' });
  }
});

// POST criar pergunta (requer auth)
router.post('/questions', auth, async (req, res) => {
  const { texto, quiz_id } = req.body;
  if (!texto || !quiz_id) {
    return res.status(400).json({ error: 'texto e quiz_id são obrigatórios' });
  }
  try {
    const question = await prisma.questions.create({
      data: {
        quiz_id: Number(quiz_id),
        texto
      }
    });
    res.status(201).json({ message: 'Pergunta criada com sucesso', question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pergunta' });
  }
});

// POST criar resposta (requer auth)
router.post('/answers', auth, async (req, res) => {
  const { question_id, texto, correta } = req.body;
  if (!question_id || !texto || typeof correta !== 'boolean') {
    return res.status(400).json({ error: 'question_id, texto e correta são obrigatórios' });
  }
  try {
    const answer = await prisma.answers.create({
      data: {
        question_id: Number(question_id),
        texto,
        correta
      }
    });
    res.status(201).json({ message: 'Resposta criada com sucesso', answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar resposta' });
  }
});

// GET quizzes (somente admin)
router.get('/quizzes', auth, isAdmin, async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      include: {
        questions: {
          include: { answers: true }
        }
      }
    });
    res.status(200).json({ quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quizzes' });
  }
});

// GET quiz por id (somente admin)
router.get('/quizzes/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: Number(id) },
      include: {
        questions: { include: { answers: true } }
      }
    });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }
    res.status(200).json({ quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quiz' });
  }
});

// POST salvar pontuação do quiz realizado pelo usuário (requer auth)
router.post('/responder-quiz', auth, async (req, res) => {
  const { quiz_id, score } = req.body;
  const user_id = req.userID;

  if (!quiz_id || score === undefined) {
    return res.status(400).json({ error: 'quiz_id e score são obrigatórios' });
  }
  try {
    const respostaUsuario = await prisma.respostas_usuarios.create({
      data: {
        quiz_id: Number(quiz_id),
        user_id,
        score: parseFloat(score),
      }
    });
    res.status(201).json({ message: 'Pontuação salva com sucesso', respostaUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar pontuação' });
  }
});

// GET histórico do usuário (requer auth)
router.get('/historico', auth, async (req, res) => {
  const user_id = req.userID;
  try {
    const respostas = await prisma.respostas_usuarios.findMany({
      where: { user_id },
      include: { quiz: true },
      orderBy: { createdAt: 'desc' },
    });
    const media = respostas.length
      ? respostas.reduce((acc, cur) => acc + cur.score, 0) / respostas.length
      : 0;
    res.status(200).json({ historico: respostas, media });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
});

// DELETE quiz (somente admin)
router.delete('/quizzes/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: Number(id) }
    });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado' });
    }
    await prisma.quizzes.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: 'Quiz excluído com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir quiz' });
  }
});

export default router;
