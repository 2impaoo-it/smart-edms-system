const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Testing SMTP connection...");
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'baoga271104@gmail.com',
      pass: 'ifpqldbyghhzvalz'
    }
  });

  try {
    let info = await transporter.sendMail({
      from: '"Test Email" <baoga271104@gmail.com>',
      to: 'baoga271104@gmail.com',
      subject: "Test SMTP Configuration",
      text: "If you receive this, the SMTP is working properly.",
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

testEmail();
