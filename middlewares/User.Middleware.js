const jwt = require('jsonwebtoken')


const userAuthMiddleware = (req,res,next) => {

    const token = req.cookies.JWT


    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }

    const verify = jwt.verify(token , process.env.JWTSECRET)
    if(!verify){
        res.clearCookie('JWT', {
            httpOnly: true,
            sameSite: 'None',
            secure: true, // only if using HTTPS
          });
        return res.status(401).json({message: "Unauthorized"})}

    req.user = verify.id
    next()




}

module.exports = {userAuthMiddleware}