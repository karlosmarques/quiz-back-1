import express from "express";
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = express.Router();

// cadastro
router.post("/registro", async (req, res) => {
  try {
    const user = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashsenha = await bcrypt.hash(user.senha, salt);

    await prisma.registro.create({
      data: {
        nome: user.nome,
        email: user.email,
        senha: hashsenha,
        datanascimento: user.datanascimento,
      }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar o usuário" });
  }
});

export default router;
