import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/usuarios', async (req, res) => {

try {
    
    const usuarios = await prisma.registro.findMany();


    res.status(200).json({message:'usuarios listados com sucesso',usuarios});

} catch (error) {
    res.status(500).json({ error: 'faha no servidor' });
}

     
})
export default router;