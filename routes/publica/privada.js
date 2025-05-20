import express, { text } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// lista de uusuarios
router.get('/usuarios', async (req, res) => {

try {
    
    const usuarios = await prisma.user.findMany();


    res.status(200).json({message:'usuarios listados com sucesso',usuarios});

} catch (error) {
    res.status(500).json({ error: 'faha no servidor' });
}
    
})

// get para perfil ou o que for necessario
router.get('/usuario', async (req, res) => {
  try {
    const usuario = await prisma.user.findUnique({
      where: {
        id: req.userID
      },
      select: {
        nome: true,
        email: true,
        
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'usuario não encontrado' });
    }
    res.status(200).json({ message: 'usuario encontrado', usuario });
  } catch (error) {
    res.status(500).json({ error: 'faha no servidor' });
  }

});

router.post('/quizzes',async(req,res)=>{
  
  try {
    const quiz = await prisma.quizzes.create({
      data: {
        titulo: req.body.titulo,
        criado_por: req.userID
      }
    });
    res.status(201).json({message:'quiz criado com sucesso', quiz});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar quiz ' });
    
  }
})

// post criar pergunta
router.post('/questions',async(req,res)=>{
  const {quiz_id,texto} = req.body;
  try {
    const question = await prisma.questions.create({
      data: {
        quiz_id: quiz_id,
        texto: texto
      }
    });
    res.status(201).json({message:'pergunta criada com sucesso', question});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pergunta ' });
    
  }
})
// criar resposta
router.post('/answers',async(req,res)=>{
  const {question_id,texto,correta} = req.body;
  try {
    const answer = await prisma.answers.create({
      data: {
        question_id: question_id,
        texto: texto,
        correta: correta
      }
    });
    res.status(201).json({message:'resposta criada com sucesso', answer});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar resposta ' });
    
  }
})
// resposta do ususario
router.post('/respostas',async(req,res)=>{
  const {question_id,resposta_id,correta} = req.body;
  try {
    const resposta = await prisma.resposta_usuarios.create({
      data: {
        usuario_id: req.userID,
        question_id: question_id,
        resposta_id: resposta_id,
        correta: correta
      }
    });
    res.status(201).json({message:'resposta criada com sucesso', resposta});
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar resposta ' });
    
  }
})
router.get('/respostas', async (req, res) => {
  try {
    const respostas = await prisma.resposta_usuarios.findMany({
      where: {
        usuario_id: req.userID
      },
      include: {
        question: true,
        resposta: true
      }
    });
    res.status(200).json({ message: 'respostas listadas com sucesso', respostas });
  } catch (error) {
    console.error('Erro no /respostas:', error); // importante para debug
    res.status(500).json({ error: 'Erro ao listar respostas' });
  }
});

router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await prisma.quizzes.findMany({
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });

    res.status(200).json({ quizzes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar quizzes' });
  }
});

router.get('/quizzes/:id', async (req, res) => {
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





export default router;