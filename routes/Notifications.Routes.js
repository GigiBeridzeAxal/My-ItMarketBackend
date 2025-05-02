const express = require('express');
const { createNotification } = require('../controllers/Notification.Controllers');
const router = express.Router();



router.post('/createNotification' , createNotification)



module.exports = router