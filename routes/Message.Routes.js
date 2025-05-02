

const express = require('express');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const { SendMessage , getallmessages, getallprofiles } = require('../controllers/Message.Controllers');
const { userAuthMiddleware } = require('../middlewares/User.Middleware');
const db = new PrismaClient();


router.post('/SendMessage' , userAuthMiddleware, SendMessage)

router.post('/getallmessages' , userAuthMiddleware , getallmessages)
router.post('/getallprofiles' , userAuthMiddleware , getallprofiles)


module.exports = router;