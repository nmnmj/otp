import express from 'express'
import Otpcontroller from '../contorller/Otpcontroller.js'
import Otpcont from '../contorller/Otpcont.js'

const router = express.Router()



router.get("/",(req, res)=>{
    res.send("work")
})


router.post("/genotp", Otpcont.genotp)


export default router