const express = require('express')
const { createproject, getprojcets, getprojectdetailsbyid, placebid, getallbids } = require('../controllers/Project.Controllers')
const { userAuthMiddleware } = require('../middlewares/User.Middleware')
const router = express.Router()


router.get("/getprojects"  , userAuthMiddleware, getprojcets)
router.post('/placebid' , userAuthMiddleware , placebid)
router.post("/getprojectdetailsbyid" , getprojectdetailsbyid)
router.post("/createproject" , createproject)
router.post("/getallbids" , getallbids)


module.exports =router