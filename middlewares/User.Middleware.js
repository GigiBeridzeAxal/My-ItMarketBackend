const jwt = require('jsonwebtoken')


const userAuthMiddleware = (req,res,next) => {

    const token = req.cookies.JWT


    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }

    const verify = jwt.verify(token , process.env.JWTSECRET)
    if(!verify){
        return res.status(401).json({message: "Unauthorized"})}

    req.user = verify.id
    next()




}

module.exports = {userAuthMiddleware}