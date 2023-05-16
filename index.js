import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/connectDB.js'
dotenv.config()
import web from './routes/web.js'

const app = express()
app.use(cors())

app.use(express.json())

connectDB(process.env.DATABASE_URL)

app.use("/", web)

app.listen(process.env.PORT || 8000, ()=>{
    console.log("running")
})