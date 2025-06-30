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
router.get('/quizzes-publico', auth, async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      include: {
        questions: {
          include: {
            answers: {
              select: {
                id: true,
                texto: true
              }
            }
          }
        }
      }
    });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quizzes para usuários' });
  }
});

// GET quiz público por ID
router.get('/quizzes-public/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await prisma.quizzes.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          include: {
            answers: {
              select: {
                id: true,
                texto: true
              }
            }
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
  const { titulo, perguntas } = req.body;

  // Validação
  if (!titulo || !Array.isArray(perguntas) || perguntas.length === 0) {
    return res.status(400).json({ error: 'Título e perguntas são obrigatórios' });
  }

  try {
    // criar quiz
    const quiz = await prisma.quizzes.create({
      data: {
        titulo,
        criado_por: req.userID
      }
    });

    for (const pergunta of perguntas) {
      // Cria pergunta
      const novaPergunta = await prisma.questions.create({
        data: {
          texto: pergunta.texto,
          quiz_id: quiz.id
        }
      });

      // Cria respostas
for (const opcao of pergunta.opcoes) {
  await prisma.answers.create({
    data: {
      question_id: novaPergunta.id,
      texto: opcao.texto,
      correta: opcao.correta === true
    }
  });
}
    }
    res.status(201).json({ message: 'Quiz criado com sucesso', quiz_id: quiz.id });
  } catch (error) {
    console.error('[ERRO AO CRIAR QUIZ COMPLETO]', error);
    res.status(500).json({ error: 'Erro ao criar quiz completo' });
  }
});


// POST criar pergunta 
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

//atualizar
router.put('/questions/:id', auth, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { texto, answers } = req.body;

  if (!texto || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Texto da pergunta e resposta são obrigatórios' });
  }

  try {
    // Atualiza a pergunta
    const perguntaAtualizada = await prisma.questions.update({
      where: { id: Number(id) },
      data: { texto }
    });

    // Atualiza ou cria respostas
    for (const resposta of answers) {
      if (resposta.id) {
        // Atualiza resposta existente
        await prisma.answers.update({
          where: { id: resposta.id },
          data: {
            texto: resposta.texto,
            correta: resposta.correta
          }
        });
      } else {
        // Cria nova resposta
        await prisma.answers.create({
          data: {
            question_id: perguntaAtualizada.id,
            texto: resposta.texto,
            correta: resposta.correta
          }
        });
      }
    }

    // Busca a pergunta atualizada com as respostas para retornar
    const perguntaComRespostas = await prisma.questions.findUnique({
      where: { id: Number(id) },
      include: { answers: true }
    });

    res.status(200).json(perguntaComRespostas);

  } catch (error) {
    console.error('[ERRO AO ATUALIZAR PERGUNTA]', error);
    res.status(500).json({ error: 'Erro ao atualizar pergunta' });
  }
});

// POST criar resposta 
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

router.post('/responder-quiz', auth, async (req, res) => {
  const { quiz_id, respostas } = req.body; 
  const user_id = req.userID;

  if (!quiz_id || !Array.isArray(respostas) || respostas.length === 0) {
    return res.status(400).json({ error: 'quiz_id e respostas são obrigatórios' });
  }

  try {
    // Busca todas as respostas corretas do quiz
    const perguntasDoQuiz = await prisma.questions.findMany({
      where: { quiz_id: Number(quiz_id) },
      include: {
        answers: {
          where: { correta: true }
        }
      }
    });

    // Mapeia respostas corretas
    const respostasCorretasMap = {};
    perguntasDoQuiz.forEach((pergunta) => {
      if (pergunta.answers.length > 0) {
        respostasCorretasMap[pergunta.id] = pergunta.answers[0].id;
      }
    });

    // Contagem dos acertos
    let acertos = 0;
    respostas.forEach(({ question_id, answer_id }) => {
      if (respostasCorretasMap[question_id] === answer_id) {
        acertos++;
      }
    });

    const total = perguntasDoQuiz.length;
    const score = (acertos / total) * 100;

    // Salva resultado do usuário na tabela respostas_usuarios
    const respostaUsuario = await prisma.respostas_usuarios.create({
      data: {
        quiz_id: Number(quiz_id),
        user_id,
        score
      }
    });

    // Agora salva cada resposta na tabela resposta_usuario_item
    const respostasItensData = respostas.map(({ question_id, answer_id }) => ({
      resposta_usuario_id: respostaUsuario.id,
      question_id,
      answer_id
    }));

    await prisma.resposta_usuario_item.createMany({
      data: respostasItensData
    });

// lista de perguntas erradas
const errosDetalhados = respostas
  .filter(({ question_id, answer_id }) => respostasCorretasMap[question_id] !== answer_id)
  .map(({ question_id }) => ({
    question_id,
    resposta_correta: respostasCorretasMap[question_id]
  }));

res.status(201).json({
  message: 'Respostas registradas com sucesso',
  resultado: {
    total,
    acertos,
    erros: total - acertos,
    score: `${score.toFixed(1)}%`,
    errosDetalhados
  }
});


  } catch (error) {
    console.error('[ERRO AO REGISTRAR RESPOSTAS]', error);
    res.status(500).json({ error: 'Erro ao registrar respostas' });
  }
});

// GET histórico pessoal do usuário (autenticado)
router.get('/historico', auth, async (req, res) => {
  const user_id = req.userID;

  try {
    const respostas = await prisma.respostas_usuarios.findMany({
      where: { user_id },
      include: {
        quiz: { select: { titulo: true } }
      },
      orderBy: { createdAt: 'desc' }
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

// GET histórico de todos os usuários (somente admin)
router.get('/historico/admin', auth, isAdmin, async (req, res) => {
  try {
   const respostas = await prisma.respostas_usuarios.findMany({
  select: {
    id: true,
    score: true,
    createdAt: true,   
    user: { select: { nome: true, email: true } },
    quiz: { select: { titulo: true } }
  },
  orderBy: { createdAt: 'desc' }
});


    // Calcula média geral dos scores (opcional)
    const media = respostas.length
      ? respostas.reduce((acc, cur) => acc + cur.score, 0) / respostas.length
      : 0;

    res.status(200).json({ resultados: respostas, media });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar histórico geral' });
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
