

const http = require('http')
const {Server} = require('socket.io')
const express = require('express')
const cookieParser = require('cookie-parser')
const { default: axios } = require('axios')
const app = express()
const cors = require('cors')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')

app.use(cookieParser())
app.use(cors({
    origin:["http://localhost:3000", "https://my-it-market-frontend.vercel.app/"],
    credentials: true,
}))

app.use(express.urlencoded({extended:true , limit:'150mb'}))
app.use(express.json({limit:'150mb'}))


const server = http.createServer(app)

const io = new  Server(server , {
    cors:{
        origin:["http://localhost:3000", "https://my-it-market-frontend.vercel.app/"],
        credentials:true
    }
})

const users = {}

app.get('/getcookies' , async(req,res) => {

    const cookies = await req.cookies

    console.log(cookies)

})


io.on("connection" , async(stream) => {

    
    const cookies = stream?.handshake?.headers?.cookie

    console.log(users , "All Users")


    stream.emit("OnlineUsers" , users)

    
    if(cookies){
        const parsed = cookie.parse(cookies)

        const token = parsed?.JWT
    
        if(token){
            const verified = jwt.verify(token , process.env.JWTSECRET)

            users[verified.id] = stream.id
            io.emit('NewUser' , verified.id)
        }
    

    }




   

 




    stream.on("disconnect", () => {

        
        io.emit("UserDisconnected" , Object.keys(users).find(fnd => users[fnd] == stream.id))
        delete users[Object.keys(users).find(fnd => users[fnd] == stream.id)]
    


        console.log("Delted User" , users)

    })
    
    
    





    

})





module.exports = {io , app , server , users}





