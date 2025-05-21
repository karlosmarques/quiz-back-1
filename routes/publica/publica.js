import express from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto'; 
import nodemailer from 'nodemailer'; 


const router = express.Router();

const prisma = new PrismaClient();


const JWT_SECRET = process.env.JWT_SECRET;


// cadastro
router.post("/registro", async (req, res) => {
  try {
    const Registro = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashsenha = await bcrypt.hash(Registro.senha, salt);

    console.log('Recebido:', Registro);

      await prisma.user.create({
      data: {
        nome: Registro.nome,
        email: Registro.email,
        senha: hashsenha,
        data_nascimento: new Date(Registro.datanascimento),
        is_admin: Registro.is_admin
      }
      
    })

    res.status(201).json();
  } catch (error) {
    console.log("Erro ao criar o usuário:", error);
    res.status(500).json({ error: "Erro ao criar o usuário" });
  }
});

//login
router.post("/login", async (req, res) => { 
  try {
    const login = req.body;
    const usuario = await prisma.user.findUnique({
      where: {
        email: login.email
        
      }
    });

    // Verifica se tem usuario
    if (!usuario) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // comprara a senha do bnco com que foi digitdo pela pessoa
    const senhaValida = await bcrypt.compare(login.senha, usuario.senha);
    if (!senhaValida){
      return res.status(400).json({ error: "Senha inválida" });
    }
   

    // token jtw
    const token = jwt.sign({ id: usuario.id, is_admin: usuario.is_admin }, JWT_SECRET, {
      expiresIn: "2h"
    });

     res.status(200).json(token);
  } catch (error){ 
    console.error("Erro ao fazer o login:",error);
    res.status(500).json({ error: "Erro ao fazer o login" });
 
  }
});

// Rota POST para solicitar redefinição de senha
router.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica se o usuário existe
    const usuario = await prisma.user.findUnique({ where: { email } });
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Gera token e validade de 1 hora
    const token = crypto.randomBytes(32).toString('hex');
    const validade = new Date(Date.now() + 60 * 60 * 1000);

    // Salva o token no banco
    await prisma.user.update({
      where: { email },
      data: {
        token_recuperacao: token,
        token_expira_em: validade,
      },
    });

    // Cria o transporter para envio de e-mail
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // seu_email@gmail.com
        pass: process.env.EMAIL_PASS  // senha de app do Gmail
      }
    });

    const link = `http://localhost:3000/redefinir-senha/${token}`;

    // Envia o e-mail
    const info = await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Olá,</p>
        <p>Você solicitou uma redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${link}">${link}</a>
        <p>O link é válido por 1 hora.</p>
      `
    });

    console.log("E-mail enviado:", info.messageId); // VERIFICAÇÃO

    res.json({ message: 'E-mail de recuperação enviado com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao enviar e-mail de recuperação.' });
  }
});

// Rota POST para redefinir a senha com o token
router.post('/redefinir-senha/:token', async (req, res) => {
  const { token } = req.params;
  const { novaSenha } = req.body;

  try {
    // Busca o usuário com token válido
    const usuario = await prisma.user.findFirst({
      where: {
        token_recuperacao: token,
        token_expira_em: { gte: new Date() },
      },
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado.' });
    }

    // Criptografa a nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha e limpa o token
    await prisma.user.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        token_recuperacao: null,
        token_expira_em: null,
      },
    });

    res.json({ message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao redefinir senha.' });
  }
});





export default router;
