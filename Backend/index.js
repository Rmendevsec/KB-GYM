require("dotenv").config()
const express = require("express")
const app = express()

const PORT = 5000
const jwt = require("jsonwebtoken")

app.use(express.json())
const posts = [{
    username: "rmen",
    title: "First Post"
}, {
    username: "john",
    title: "Hello World"
}]
app.get("/posts", (req, res) =>{
    res.json(posts)
    

})

app.post("/login", (req,res)=>{
    const username = req.body.username
    const user = {name: username}
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE)
    res.json({accessToken: accessToken})

})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})