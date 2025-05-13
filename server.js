import express from 'express';
import publicRoutes from "./routes/publica/publica.js"


const app = express()


app.use("/", publicRoutes)


app.listen(8000,() => console.log("servidor rodando na porta:8000") )