require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDb = require('./config/db')
const authRouter = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const app = express()

connectDb()
const port = 3000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin:process.env.ORIGIN,
  credentials:true
}))

app.use(express.static("public"))

app.use("/api/auth",authRouter)


app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})