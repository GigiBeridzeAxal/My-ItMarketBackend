const { PutObjectCommand } = require('@aws-sdk/client-s3')
const { createforumpost, getforumdata } = require('../controllers/Forum.Controllers')
const { userAuthMiddleware } = require('../middlewares/User.Middleware')
const multer = require('multer')

const router = require('express').Router()
const storage = multer.memoryStorage()
const upload = multer({storage: storage})



router.post('/createforumpost', userAuthMiddleware , upload.single('file') ,   createforumpost)
router.get('/getforumdata' , getforumdata)

module.exports = router