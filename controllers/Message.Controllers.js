const { PrismaClient } = require("@prisma/client");
const { io, users } = require("../socket");

const db = new PrismaClient();

const SendMessage = async (req, res) => {
  const { message, receiverid } = req.body;

  console.log(message, receiverid, req.user, "All Infromation");

  if (!message || !receiverid || !req.user) {
    return res.status(500).send("Please Fill All Fields And Try Again");
  }

  const params = {
    messageby: req.user,
    messageto: receiverid,
    message: message,
    sendtime: new Date(Date.now()).toISOString(),
  };

  io.to(users[req.user]).emit("SendMessage", { ...params, sendbyme: true });
  io.to(users[receiverid]).emit("SendMessage", { ...params, sendbyme: false });

  const sendmessage = await db.messages.create({ data: params });

  res.json("Message Send Succesfully")
};

const getnextmessages = async (req, res) => {

  const { profileid, lastmessagesendtime } = req.body;

  const getnextmessages = await db.messages.findMany({
    where: {
      OR:[
        {messageby: profileid , messageto: req.user},
        {messageto: profileid , messageby: req.user}
        
      ],
      sendtime:{
        lte: lastmessagesendtime
      },
    },
    take: 20,
    orderBy: {
      sendtime: "asc",
    },
  })

  console.log(new Date(getnextmessages[0].sendtime).getTime() ,  new Date(lastmessagesendtime).getTime() )
  if(new Date(getnextmessages[0].sendtime).getTime() === new Date(lastmessagesendtime).getTime()){
    console.log("No  More MEssages")
    res.status(201).send("No More Messages")
  }else{
    res.status(200).json(getnextmessages)
  }


  
};

const getallprofiles = async (req, res) => {

  const { profileid  , allprofiles} = req.body;


  const allmessages = await db.messages.findMany({
    where: {
      OR: [
        {
          messageby: req.user,
        },
        {
          messageto: req.user,
        },
      ],
    },
    select: {
      messageby: true,
      messageto: true,
    },
  });

  const uniqueids = new Set();
  let lastmessages = [];

  allmessages.forEach((data) => {
    if (data.messageby == req.user) {
      uniqueids.add(data.messageto);
    }

    if (data.messageto == req.user) {
      uniqueids.add(data.messageby);
    }
  });

  const arrayids = Array.from(uniqueids);

  const findusersfromids = await db.user.findMany({
    where: {
      id: {
        in: arrayids,
      },
    },
  });
  const allprofilesid = allprofiles.map(data => data.id)
     

  const filteredusers = findusersfromids.filter(filt => !allprofilesid.includes(filt.id))

  const getessentialmessages = findusersfromids.map((data) =>
    db.messages.findMany({
      where: {
        OR: [
          {
            messageby: data.id,
            messageto: req.user,
          },
          {
            messageby: req.user,
            messageto: data.id,
          },
        ],
      },
      take: 20,

      orderBy: {
        sendtime: "desc",
      },
    })
  );

  delete filteredusers.password;
  delete filteredusers.Funds;

  const lastmessagesarray = await Promise.all(getessentialmessages);


    if( profileid &&filteredusers.map((data) => data.id).includes(profileid) == false) {

      const getuserwithid = await db.user.findUnique({where: {id: profileid}})
      filteredusers.push(getuserwithid);
  
  
  
  
    }





  res
    .status(200)
    .json({ users: filteredusers, lastmessages: lastmessagesarray.flat() });
};

module.exports = { SendMessage, getnextmessages, getallprofiles  };
