import bcrypt from "bcryptjs";
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  email:{
    type: String,
    required:[true,"Email is required"],
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email"
    ],  
    unique:[true, "Email already exits"]
  },
  username:{
    type: String,
    required:[true, "Username is required"],
  },
  password:{
    type: String,
    requied:[true, "Password required"],
    minlength:[6,"Password should be atleast 6 characters"],
    select: false
  }
},{
  timestamps: true
})

userSchema.pre("save", async function (next){
  if(!this.isModified("password")){
    return next()
  }
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
})

userSchema.method.comparePassword = async function (password){
  return await bcrypt.compare(password, this.password)
}

const userModel = new mongoose.model("user", userSchema);

export default userModel;