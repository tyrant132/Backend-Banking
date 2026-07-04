import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import { sendTransactionEmail } from "../services/email.service.js"
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";

/**
 * 10 STEP TRANSFER FLOW
 * Validate request
 * Validate idempotency key
 * Check account status
 * Derive sender balance from ledger
 * Create transaction (Default status: PENDING)
 * Create DEBIT ledger entry
 * Create CREDIT ledger entry
 * Mark transaction complete
 * Commit MongoDB session
 * Send email notification
 */

async function createNewTransaction(req,res){

  /**
   * 1. Validate Account
   */
  const {fromAccount, toAccount, amount, idempotencyKey} = req.body;
  if(!fromAccount||!toAccount||!amount||!idempotencyKey){
    return res.status(400).json({
      message: "FromAccount, toAccount, amount and idempotency key are required"
    })
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })
  if(!fromUserAccount||!toUserAccount){
    return res.status(400).json({message: "Invalid account"})
  }
  /**
   * 2. Validate Idempotency Key
   */
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
  })

  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === "COMPLETED") return res.status(200).json({
      message: "Transaction successful",
      transaction: isTransactionAlreadyExists
    })
    else if(isTransactionAlreadyExists.status === "PENDING") return res.status(200).json({message: "Transaction Pending"});
    else if(isTransactionAlreadyExists.status === "REVERSED") return res.status(500).json({message: "Transaction reversed"})
    else return res.status(500).json({message: "Transaction failed"})
  }
  /**
   * 3. Check account status
   */
  if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({message: "Both fromAccount and toAccount must be ACTIVE"})
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance()
  if(balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}, Requested
      amount is ${amount}`
    })
  }

  /**
   * 5. Create transaction
   */
  try{
    const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
  }], {session})[0]

  const debitLedgerEntry = await ledgerModel.create([{
    account: fromAccount,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
  }], {session})

  await (() => {
    return new Promise((resolve) => setTimeout(resolve, 15*1000))
  })()

  const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT"
  }], {session})

  await transactionModel.findOneAndUpdate(
    {_id: transaction._id},
    {status: "COMPLETED"},
    {session}
  )

  await session.commitTransaction()
  session.endSession()
  }catch(error){
    
    return res.status(400).json({
      message: "Transaction is pending try again some time later",
    })

  }
  

  /**
   * 10. Send email notification
   */

  await emailService.sendTransactionEmail(req.user.email, req.user.username,amount, toAccount)

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction
  })

}

async function createInitialFunds(req, res){
  const {toAccount, amount, itempotencyKey} = req.body;

  if(!toAccount||!amount||!itempotencyKey){
    return res.status(400).json({message: "toAccount, Amount and ItempotencyKey are required"})
  }

  const toUserAccount = await accountModel.findOne({
    _id: toAccount
  })

  if(!toUserAccount) return res.status(400).json({message: "Invalid credentials"})
  
  const fromUserAccount = await accountModel.findOne({
    systemUser: true,
    user: req.user._id
  })

  if(!fromUserAccount){
    return res.status(400).json({message: "System user account not found"})
  }

  const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = await transactionModel.create({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING"
  },{session})

  const debitLedgerEntry = await ledgerModel.create([{
    account: fromUserAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "DEBIT"
  }],{session})

  const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "CREDIT"

  }], {session})

  transaction.status = "COMPLETED"
  await transaction.save({session})

  await session.commitTransaction()
  session.endSession()

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction
  })

}

export {createNewTransaction, createInitialFunds};

