import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const isAdmin = async (req, res, next) => {
try {
const usuario = await prisma.user.findUnique({
where: { id: req.userID }, // req.userID vem do middleware auth
select: { is_admin: true },
});
if (!usuario) {
return res.status(404).json({ error: 'Usuário não encontrado' });
}
if (!usuario.is_admin) {
return res.status(403).json({ error: 'Acesso negado: apenas administradores podem fazer isso.' });
}
next();

} catch (error) {
return res.status(500).json({ error: 'Erro ao verificar permissões de administrador.' });
}
};
export default isAdmin;