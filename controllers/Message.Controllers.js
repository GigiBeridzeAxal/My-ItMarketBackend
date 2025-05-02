const {PrismaClient}  = require('@prisma/client')
const {io, users} = require('../socket')

const db = new PrismaClient()



const SendMessage = async(req,res) => {

    const {message , receiverid} = req.body


    console.log(message , receiverid , req.user , "All Infromation")

    if(!message || !receiverid || !req.user){
        return res.status(500).send("Please Fill All Fields And Try Again")}


    const params = { 

        messageby:req.user,
        messageto:receiverid,
        message:message,

    }


    io.to(users[req.user]).emit("SendMessage" , {...params , sendbyme:true})
    io.to(users[receiverid]).emit("SendMessage" , {...params , sendbyme:false})

    const sendmessage = await db.messages.create({data:params})




}

const getallmessages = async(req,res) => {
    
    const {userid} = req.body

    if(!userid || !req.user){
        return res.status(500).send("Please Fill All Fields And Try Again")}

    const getallmessages = await db.messages.findMany({
        where:{
            OR:[
                {
                    messageby:userid,
                    messageto:req.user
                },
                {
                    messageby:req.user,
                    messageto:userid
                }
            ]
        }
    })

    const withoutid = getallmessages.map((item) => {
        

        delete item.id

        item.sendbyme = item.messageby == req.user ? true : false

        return item

    })


    res.status(200).json(getallmessages.reverse())

}

const getallprofiles = async(req,res) => {
    
    const allmessages = await db.messages.findMany({

       where:{
        OR:[
            {
                messageby:req.user,
            },
            {
                messageto:req.user,
            }
        ]
       },
       select: {
        messageby: true,
        messageto: true,
      }

    })

    const uniqueids = new Set()

    allmessages.forEach((data) => {

        if(data.messageby == req.user) {
            uniqueids.add(data.messageto)

            
        } 
        
        if(data.messageto == req.user) {
            uniqueids.add(data.messageby)

        }
      
   
    })


    const arrayids = Array.from(uniqueids)


    const findusersfromids = await db.user.findMany({
        where:{
            id:{
                in:arrayids
            }
        }
    })

    delete findusersfromids.password
    delete findusersfromids.Funds



    res.status(200).json(findusersfromids)

}                                                                                        


module.exports = {SendMessage , getallmessages , getallprofiles}