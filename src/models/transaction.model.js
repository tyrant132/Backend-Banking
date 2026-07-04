import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({

  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "transaction must be assocaited with a from accunnt"],
    index: true
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true, "transaction must have a to Account"],
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      message: "Status can either be PENDING, COMPLETED, FAILED, REVERSED",
    },
    default:"PENDING"
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating a transaction"],
    min: [0,"Transaction can't be negative"]
  },
  idempotencyKey: {
    type: String,
    required: [true, "idempotency Key is required for creating a transaction"],
    index: true,
    unique: true
  },

},{
  timeStamps: true
})

const transactionModel = mongoose.model("transaction",transactionSchema);

export default transactionModel;