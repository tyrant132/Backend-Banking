import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import {sendRegistrationEmail} from "../services/email.service.js";

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
  res.cookie("token",token)
  res.status(201).json({
    user:{
      _id:user._id,
      email: user.email,
      name:user.username
    },
    token:token
  })

  await sendRegistrationEmail(user.email, user.username)

} 

async function loginUser(req, res){
  const {email, password} = req.body;

  const user = await userModel.findOne({
    email
  }).select("+password")
  if(!user) return res.status(401).json({message: "Email or Password is Invalid"})
  const isValidPassword = user.comparePassword(password)
  if(!isValidPassword) return res.status(401).json({message: "Email or Password is Invalid"})
  const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})
  res.cookie("token", token)
  return res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name
    },
    token
  })

}

export {registerUser, loginUser};