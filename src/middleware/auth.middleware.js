import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import tokenBlacklistModel from "../models/blacklist.model.js";


async function authMiddleware(req, res,next){
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).json({message: "Unauthorized access"})
  }

  const isBlackListed = await tokenBlacklistModel.findOne({
    token
  })

  if(isBlackListed){
    return res.status(401).json({message: "Token is unauthorized"})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.userId)
    req.user = user;
    return next();

  } catch (err) {
     return res.status(401).json({message: "Unauthorized access"})
  }
}

async function authSystemUserMiddleware(req, res, next){
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
  if(!token){
    return res.status(401).json({
      message: "Unauthorized access, token missing"
    })
  }

  const isBlackListed = await tokenBlacklistModel.findOne({
    token
  })

  if(isBlackListed){
    return res.status(401).json({message: "Token is unauthorized"})
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if(!user.systemUser){
      return res.status(403).json({message: "forbidden access"})
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access, token is invalid"
    })
  }
}

export {authMiddleware,authSystemUserMiddleware};