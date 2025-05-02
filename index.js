const express = require('express')
const { app , server } = require('./socket')
const cors = require('cors')
const socket = require('socket.io')

app.use(cors({
    origin:"http://localhost:3000",
    credentials: true,
}))
const cookieparser = require('cookie-parser')
const { userAuthMiddleware } = require('./middlewares/User.Middleware')





app.use('/User' , require('./routes/User.Routes'))
app.use('/forum' , require('./routes/Forum.Routes'))
app.use('/projects' , require('./routes/Project.Routes'))
app.use('/message' , require('./routes/Message.Routes'))
app.use('/notification' , require('./routes/Notifications.Routes'))



server.listen(4000 , () => console.log("Server Succesfuly Started"))