import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';

async function registerUser(req, res){
  const {email, username, password} = req.body;
  const isExists = await userModel.findOne({
    email
  })
  if(isExists) return res.status(422).json({message: "User already exists", status: "failed"})
  
  const user = await userModel.create({
    email, username, password
  })
  const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{expiresIn: "3d"})
  res.cookie("jwt_token",token)
  res.status(201).json({
    user:{
      _id:user._id,
      email: user.email,
      name:user.username
    },
    token:token
  })
} 

export {registerUser};