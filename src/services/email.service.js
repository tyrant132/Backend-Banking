import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BACKEND LEDGER" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail,username){
  const subject = "Welcome to Backend Ledger";
  const text = `Hello ${username}, \n\nThank you for registering at Backend Ledger.We're excited to have you on
  board!\n\nBest Regards, \nTHe Backend Ledger Team`;
  const html = `<p>Hello ${username},</p><p>Thank you for registering at Backend Ledger. We're excited to have you on
  board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;
}

async function sendTransactionEmail(userEmail, name, amount, toAccount){
  const subject = "Transaction Successful!";
  const text = `Hello ${name},\n\nYour transactin of ${amount} to account ${toAccount} has been successfull`;
  const html = `<p>Hello ${name},</p><p>Your transaction of$${amount} to account ${toAccount} is successfull</p>`
  
  await sendEmail(userEmail,subject,text,html)
}

async function sendTransactionFailed(userEmail, name, amount, toAccount){
  const subject = "Transaction Failed!";
  const text = `Hello ${name},\n\nYour transactin of ${amount} to account ${toAccount} has been failed`;
  const html = `<p>Hello ${name},</p><p>Your transaction of$${amount} to account ${toAccount} has failed</p>`
  
  await sendEmail(userEmail,subject,text,html)
}

export {transporter,sendEmail,sendRegistrationEmail,sendTransactionEmail,sendTransactionFailed};