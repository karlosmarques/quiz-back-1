import express from 'express';
import publicaRoutes from "./routes/publica/publica.js"
import privadaRoutes from "./routes/publica/privada.js"
import auth from './middlewares/auth.js';
import cors from 'cors';
import isAdmin from './middlewares/isAdmin.js';






const app = express()
app.use(express.json())
app.use(cors())

app.use("/",publicaRoutes)
app.use("/", auth,privadaRoutes)


app.listen(8000,() => console.log("servidor rodando na porta:8000") )