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
## 2. Como Rodar o Projeto
### 2.1 Clonando o Repositório Back
```bash
$ git clone https://github.com/beladays/quiz-back.git
````
### 2.2 Clonando o Repositório Front
```bash
$ git clone https://github.com/beladays/quiz-angular.git
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
ng serve -o
````
## 3. Funcionalidades
-✅ Login de usuários e administradores
-✅ Resposta a quizzes com exibição de resultado
-✅ Área administrativa com criação, edição e exclusão de quizzes
-✅ Proteção de rotas por autenticação
