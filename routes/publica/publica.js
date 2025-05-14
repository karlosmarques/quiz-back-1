import express from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";


const router = express.Router();
const prisma = new PrismaClient();


// cadastro
router.post("/registro", async (req, res) => {
  try {
    const Registro = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashsenha = await bcrypt.hash(Registro.senha, salt);

   const sla =  await prisma.Registro.create({
      data: {
        nome: Registro.nome,
        email: Registro.email,
        senha: hashsenha,
        datanascimento: new Date(Registro.datanascimento)
      }
    })



    res.status(201).json(sla);
  } catch (error) {
    console.error("Erro ao criar o usuário:", error);
    res.status(500).json({ error: "Erro ao criar o usuário" });
  }
});

router.post ("/login", async (req, res) => {
  try{
    login = req.body;

    const usuario = await prisma.Registro.findUnique({
      where: {
        email: login.email

      }
    })
  
  }catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
    
  }


export default router;
