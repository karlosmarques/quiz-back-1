# Quiz da Galera
Este projeto é um sistema de quiz onde **apenas administradores autenticados** podem
**criar, editar e excluir quizzes**, enquanto **alunos logados** podem **responder quizzes e
visualizar os resultados**.
## 1. Tecnologias Utilizadas
### 1.1 Back-end
- **Node.js** + **Express** – Servidor da aplicação
- **Prisma** – ORM para acesso ao banco de dados
- **MySQL** – Banco de dados relacional
- **bcrypt** – Criptografia de senhas
- **jsonwebtoken** – Autenticação via JWT
- **dotenv** – Variáveis de ambiente
- **nodemailer** – Envio de e-mails
- **cors** – Permissão de requisições entre front-end e back-end
### 1.2 Front-end
- **React** – Biblioteca para criação da interface
- **React Router DOM** – Gerenciamento de rotas
- **Axios** – Comunicação com o back-end
- **Bootstrap + React Bootstrap** – Estilização
- **jwt-decode** – Decodificação de token JWT
---
## 2. Como Rodar o Projeto
### 2.1 Clonando o Repositório Back
```bash
$ git clone git@github.com:karlosmarques/quiz-back.git
````
### 2.2 Clonando o Repositório Front
```bash
$ git clone git@github.com:karlosmarques/quiz-front.git
````
### 2.3 Rodar o Back-End
> Certifique-se de ter o banco de dados MySQL configurado corretamente e as variáveis no
arquivo `.env`.
```bash
cd quiz-back
npm i
npx prisma generate
node --watch server.js
````
### 2.4 Rodar o Front-End
```bash
cd quiz-front
npm i
npm start
````
## 3. Funcionalidades
-✅ Login de usuários e administradores
-✅ Resposta a quizzes com exibição de resultado
-✅ Área administrativa com criação, edição e exclusão de quizzes
-✅ Proteção de rotas por autenticação
## 4. Estrutura do Projeto
```
├── quiz-front
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── Cards/ <- Card da tela principal
│ │ │ ├── Cardsperguntas/ <- Onde ficam as questões do quiz
│ │ │ └── Navbar/ <- Navegação principal
│ │ ├── pages/ <- Páginas do projeto
│ │ │ ├── CriarQuiz/ <- Criar um novo quiz com perguntas e respostas
│ │ │ ├── Esqueci_minha_senha/ <- Página de recuperação de senha
│ │ │ ├── Home/ <- Quizzes disponíveis e funcionalidades específicas do
administrador
│ │ │ ├── Login/ <- Página de autenticação
│ │ │ ├── Paginaquiz/ <- Exibe um quiz específico
│ │ │ └── perfil/ <- Página de perfil do usuário
│ │ │ ├── Redefinir_senha/ <- Permite que o usuário redefina sua senha
│ │ │ └── Registro/ <- Registrar novos usuários
│ │ │ └── App.js <- Conecta cada URL com um componente
│ │ │ └── index.js <- Inicializa toda a aplicação no navegador
│ ├── package.json <- Dependências e scripts
│ ├── package-lock.json
│ └── README.md
├── quiz-back/
│ ├── middlewares/
│ │ ├── auth.js <- Protege rotas do usuário autenticado
│ │ └── isAdmin.js <- Verifica se o usuário autenticado é administrador
│ ├── node_modules/ <- Pacotes e dependências do projeto
│ ├── prisma/
│ │ └── schema.prisma <- Estrutura do banco de dados
│ └── routes/ <- Rotas
│ │ ├── publica.js <- Rotas de usuário
│ │ └── privada.js <- Rotas gerais
│ ├── package.json <- Dependências e scripts
│ ├── package-lock.json
│ ├── server.js <- Chamada de rotas
│ ├── .env <- Dados sensíveis
│ └── README.md
```
