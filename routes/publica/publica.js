import express from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


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




export default router;
