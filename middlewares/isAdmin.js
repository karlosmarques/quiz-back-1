import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.userID) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: req.userID },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (!usuario.is_admin) {
      return res.status(403).json({ error: 'Acesso negado: apenas administradores podem realizar esta ação.' });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware isAdmin:', error);
    return res.status(500).json({ error: 'Erro ao verificar permissões de administrador.' });
  }
};

export default isAdmin;
