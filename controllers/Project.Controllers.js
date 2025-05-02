

const jwt = require('jsonwebtoken')
const { io, projectlogger } = require('../socket')
const {PrismaClient} = require('@prisma/client')
const db = new PrismaClient()



const getprojcets = async(req,res) => {


    const getprojectsdata = await db.projects.findMany()

    getprojectsdata.sort((a,b) => {
        return new Date(b.projectposttime) - new Date(a.projectposttime)
    })

    res.json(getprojectsdata)


}

const createproject = async(req,res) => {

    const {projecttags , projecttitle , projectprice , projectdescription} = req.body

    if( !projecttags || !projecttitle || !projectprice || !projectdescription){
        res.status(500).send("Failed To Create Project All Fields Are Required")
    }else{

        const token = req.cookies.JWT

        const verify = jwt.verify(token , process.env.JWTSECRET)
        
       const create = await db.projects.create({
        data:{projectowner:verify.id,
        projectdescription:projectdescription,
        projectittle:projecttitle,
        projecttags:projecttags,
        projectprice:projectprice
        }
       })

       io.emit("AddnewProject" , "Hello")

       if(create){
  
        res.json(create)
       }



    }



}

const getprojectdetailsbyid = async(req,res) => {


    const {projectid} = req.body

    if(!projectid) {return res.status(500).send("Project Id Not Defined")}
    
    const getproject = await db.projects.findUnique({where:{id:projectid}})
    const projectowner = await db.user.findUnique({where:{id:getproject.projectowner}})

    
    if(!getproject) {return res.status(202).send("Project Not Found")}
    if(!projectowner) {return res.status(202).send("Project Owner Not Found")}
    

    res.status(200).json({projectinfo:getproject , clientinfo:projectowner})
    

}

const placebid = async(req,res) => {

    try{
        const {bidprice , biddays , projectid} = req.body

    console.log(req.body)


    if(!bidprice || !biddays || !projectid ){
        return res.status(500).send("Please Fill All Fields And Try Again")
    }else{

        const placebid = await db.bid.create({
            data:{
                bidby:req.user,
                bidprice:Number(bidprice),
                bidedproject:projectid,
                bidtime:Number(biddays)
                

            } 
            
        })

        if(placebid){
            const findbidvalue = await db.user.findUnique({where:{id:req.user}})
            const editbidvalue = await db.user.update({where:{id:req.user} , data:{bids:findbidvalue.bids - 1} })
            res.status(200).send("You Succesfully Bid On Project")
        }else{
            res.status(500).send("Bid Not Placed Try Again")
        }

    }
    }catch(err){
        console.log(err)
        res.status(500).send("Something Went Wrong Please Try Again")
    }


}

const awardproject = async(req,res) => {





}


const getallbids = async(req,res) => {


    const {projectid} = req.body

    console.log(projectid)


    if(!projectid) {return res.status(500).send("Project Id Not Defined")}

    const getbids = await db.bid.findMany({where:{bidedproject:projectid}})

    const allbids = getbids.map(data =>  data.bidby)

    const getbidusers = await db.user.findMany({where:{
        id:{
            in:allbids
        }
    }})


    getbidusers.forEach(data => {
        delete data.Funds
        delete data.password
        data.email = data.email.split('@')[0]
        delete data.role
    }) 



    console.log(getbidusers , "Users With Bid")



    if(getbids){
        res.status(200).json({Allbids:getbids , bidusers:getbidusers})
    }

    


}



module.exports = {createproject , getprojcets , getprojectdetailsbyid , placebid  ,getallbids , awardproject}