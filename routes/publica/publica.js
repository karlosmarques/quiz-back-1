import express from "express";


const router = express.Router()


// cadastro

router.post("/registro",(req,res)=>{

    const user = req.body

    res.status(201).json(user)

})

export default router;