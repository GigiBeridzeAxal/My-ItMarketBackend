const prismadb = require('@prisma/client')


const db = new prismadb.PrismaClient()

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const getforumdata = async(req,res) => {
   try{

    const getforumdata = await db.forum.findMany()

    getforumdata.sort((a,b) => {
        return new Date(b.forumposttime) - new Date(a.forumposttime)
    })

    console.log(getforumdata)

    if(!getforumdata){
        return res.status(404).json({message: "No Forum Data Found"})
    }
    
    for (data in getforumdata){

      const getuser = await db.user.findUnique({
        where:{
            id:getforumdata[data].forumowner
        }
      })

      if(getuser){
        delete getuser.password
        getuser.email = getuser.email.split('@')[0]

      
      }

      getforumdata[data].forumowner = getuser

    }


    res.status(200).json(getforumdata)


   }catch(err){
    res.json({message: err.message})
   }

    


}


const s3client = new S3Client({

    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },

})






const createforumpost = async(req,res) => {
    
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key:Date.now().toString() + "-" + req.file?.originalname,
        Body:req.file.buffer,
        ContentType:req.file.mimetype,
    }
    
const command = new PutObjectCommand(params)


  const send = await s3client.send(command)
  console.log(params.Key)



    const {forumdesc} = req.body;
     

    console.log(forumdesc)


    if(!forumdesc){
        return res.status(400).json({message: "Please fill all the fields"})
    }

    try{

   

        

        const files = [
            params.Key
        ]
        
        
        const newpost = {
            forumdesc:forumdesc,
            forumfiles:req.file ? files : null,
            forumowner:req.user
        }

        const createpost = await db.forum.create({
            data:newpost
        })

        if(createpost){
            res.status(200).json({message: "Post Created Successfully"})
        }else{
            res.status(500).json({message: "Failed to create post"})
        }

     





       // console.log(req.body)

    }catch(err){
        console.log(err)
    }

    



    




}

module.exports = {createforumpost , getforumdata}