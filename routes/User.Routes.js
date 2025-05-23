
const express = require('express')
const { RegisterUser, loginuser, userdata  , logout, edituser, getallfreelancerusers,getmyjobposts , getuserbyid, getjobinfo, changeprofileiamge } = require('../controllers/User.Controllers')
const { userAuthMiddleware } = require('../middlewares/User.Middleware')
const multer = require('multer')
const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

router.post("/CreateUser" , RegisterUser)
router.post("/login" , loginuser)
router.post("/userdata" , userdata)
router.post("/logout" , logout)
router.get('/getallfreelancerusers' , getallfreelancerusers)
router.post('/getuserbyid' , getuserbyid)
router.post('/changeprofileimage' , userAuthMiddleware  , upload.single('file'), changeprofileiamge)

router.post("/getmyjobposts" , userAuthMiddleware , getmyjobposts)

router.post('/getjobinfo'  , userAuthMiddleware, getjobinfo)

router.patch('/edituser' , userAuthMiddleware , edituser)

module.exports = router

