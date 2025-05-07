const { PrismaClient } = require("@prisma/client")


const db = new PrismaClient()

const { PutObjectCommand , S3Client, DeleteBucketAnalyticsConfigurationCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const s3client = new S3Client({

    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },

})

const jwt = require('jsonwebtoken')



const RegisterUser = async( req,res ) => {
    const {username , password , email , role} = req.body

    


    try{

        const findifuserexist = await db.user.findUnique({
            where:{email:email}
        })

        if(findifuserexist){
            res.status(201).send("User Already Registered")
        }else{


            const createuser = await db.user.create({
                data:{
                    username:username,
                    password:password,
                    email:email,
                    
                }
    
            })

            delete createuser.password

            

            

     



            const token = jwt.sign(createuser , process.env.JWTSECRET)

            console.log(token)

            if(createuser){

                res.cookie("JWT" , token , {
                    httpOnly: true,
                    secure:true, // true in production
                    sameSite: 'None', // CSRF protection
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                })


                res.status(200).send("New User Succesfuly Created")
            }
    
    
        }


      
     

    }catch(err){
        console.log(err)
    }

    




}

const loginuser = async(req,res) => {

    const {email , password} = req.body

    if(!email || !password){
        res.status(500).send("All Fields Required")
    }else{

        const checkifuserexist = await db.user.findUnique({
            where:{email:email}
        })

        if(checkifuserexist){

            const userpassword = checkifuserexist.password

            if(userpassword === password){
                const user = checkifuserexist
                delete user.password
                const token = jwt.sign(user , process.env.JWTSECRET)
        



                res.cookie('JWT' , token , {


                    httpOnly: true,
                    secure:true, // true in production
                    sameSite: 'None', // CSRF protection
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                })

                req.user = user.id
                


                res.status(200).json("User Succesfuly Logged In")
                console.log("Logged In")
            }else{
                res.status(201).json("Password Didnt Match")
                console.log("Didnt Match")
            }
        }else{
            res.status(201).json("Account Didnt Exists")
        }

    }

    


}

const userdata = async(req,res) => {



        const token = req.cookies.JWT


        if(!token) return res.status(205).send("Unauthorized")
    
            console.log(token , "Sdawdasd")
        const verify =  jwt.verify(token , process.env.JWTSECRET)
        
        if(!verify) return res.status(205).send("Token Not valid")

        const data = await db.user.findUnique({where:{id:verify.id}})

        if(!data) return res.status(205).send("User Not Found")
    
        res.status(200).json(data)

  

}

const edituser = async(req,res) => {

try{
    const {headline , description} = req.body


    if(headline){
        const edit = await db.user.update({
            where:{id:req.user},
            data:{
                headline:headline
            }
        })

        if(!edit) return res.status(500).send("Failed To Update Headline")
        
        delete edit.password
        delete edit.email
        delete edit.Funds

        res.status(200).json(edit)
    }

    if(description){
        const edit = await db.user.update({
            where:{id:req.user},
            data:{
                description:description
            }
        })

        if(!edit) return res.status(500).send("Failed To Update Headline")
        
        delete edit.password
        delete edit.email
        delete edit.Funds

        res.status(200).json(edit)
    }
}catch(err){
    console.log(err)
}


}

const getuserbyid = async(req,res) => {

    const {userid} = req.body

    if(!userid) { return res.status(500).send("Userid Not Defined")}

    const find = await db.user.findUnique({where:{id:userid}})

    if(find){
        res.status(200).send(find)
    }else{
        res.status(205).send("User Not Found")
    }

}

const getallfreelancerusers = async(req,res) => {

    const getallusers = await db.user.findMany()



     res.json(getallusers)



}

const logout = (req,res) => {

    const remove =  res.clearCookie('JWT');

    res.json("You Logged Out")


}

const getmyjobposts = async(req,res) => {

    const jobposts = await db.projects.findMany({where:{projectowner:req.user}})

    if(jobposts){
        res.status(200).send(jobposts)
    }else{
        res.status(500).send("Something Went Wrong Please Try Again")
    }

}

const changeprofileiamge = async(req,res) => {

    const file = req.file

    console.log(req.file)

    const user = await db.user.findUnique({where:{id:req.user}})

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: Date.now().toString() + "-" + file?.originalname,
        Body: file?.buffer,
        ContentType: file?.mimetype,
    }

    const command = new PutObjectCommand(params)


    const changefile = await s3client.send(command)


    const deleteparams = {
        Bucket: process.env.AWS_BUCKET,
        Key:user.profilepic,
    }
    const deletecommand = new DeleteObjectCommand(deleteparams)
    const deletefile = await s3client.send(deletecommand)

    if(!deletefile) return res.status(500).send("Failed To Delete Old Profile Image")



        const edit = await db.user.update({
            where:{id:req.user},
            data:{
                profilepic:params.Key
            }
        })

        if(!edit) return res.status(500).send("Failed To Update Profile Image")
        
        delete edit.password
        delete edit.email
        delete edit.Funds

        res.status(200).json(edit.profilepic)






}


const getjobinfo = async(req,res) => {


    const {projectid} = req.body

    console.log(projectid)

    
    if(!projectid) {return res.status(500).send("You Dont Have Acesss")}

    const getproject = await db.projects.findUnique({where:{id:projectid}})

    console.log(getproject)

    const bidsforproject = await db.bid.findMany({where:{bidedproject:getproject.id}})

    const bidids = bidsforproject.map(data => data.bidby)

    console.log(bidids)

    const usersfrombids = await db.user.findMany( 
        {where:{
            id:{
                in:bidids
            }
        }}
    )

   
    const users =  new Map()

    const bidplusdata =  usersfrombids.forEach(data => {

        delete data.Funds
        delete data.password
        delete data.profilecompleated
        delete data.skills
        delete data.role
        
        users.set(data.id , data)


    })


    const addbiddata =  bidsforproject.forEach(data => {

        const user = users.get(data.bidby)

        user.bidprice = data.bidprice
        user.bidtime = data.bidtime
      

    })


    console.log(users)
    const usersarray = Array.from(users.values())
    if(getproject.projectowner !== req.user) {return res.status(500).send("You Dont Have Access By User")}

    if(getproject.projectowner === req.user){
        res.json(usersarray)
    }
  





}

module.exports = {RegisterUser , loginuser , getmyjobposts , userdata , logout , edituser , getallfreelancerusers , getuserbyid , getjobinfo , changeprofileiamge}