import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
  account:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: [true,"Ledger must be associated with an Account"],
    index: true,
    immutable: true,
  },
  amount:{
    type:Number,
    required: [true, "Amount must be given to create a record"],
    immutable:true,
    min: [0, "Amount can't be negative"],
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required:[true, "Ledger must be associated with a transaction"],
    index: true,
    immutable:true,
  },
  type:{
    type: String,
    enum:{
      values:["CREDIT", "DEBIT"]
    },
    required:[true,"Ledger type is required"],
    immutable: true,
  }
})

function preventLedgerModification(){
  throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification);
ledgerSchema.pre('remove',preventLedgerModification);
ledgerSchema.pre('deleteOne',preventLedgerModification);
ledgerSchema.pre('updateOne',preventLedgerModification);
ledgerSchema.pre('deleteMany',preventLedgerModification);
ledgerSchema.pre('findOneAndDelete',preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification);

const ledgerModel = mongoose.model("ledger",ledgerSchema);

export default ledgerModel;
