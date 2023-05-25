const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1.新增 transporter(轉運)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2.定義 email options
  const mailOptions = {
    from: 'Near Moonydog12 <moonydog12@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3.寄信
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
