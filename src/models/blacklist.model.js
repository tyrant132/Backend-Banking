import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema({
  token:{
    type: String,
    required: [true, "Token is required to blacklist"],
    unique: [true, "Token is already blacklisted"]
  },
  blackListedAt:{
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true
})

tokenBlacklistSchema.index({createdAt: 1},{
  expireAfterSeconds: 60*60*24*3 // 3days
})

const tokenBlacklistModel = mongoose.model("tokenBlackList", tokenBlacklistSchema)

export default tokenBlacklistModel;