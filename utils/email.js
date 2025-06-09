const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Snapgram ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendCode(subject, code, typeCode) {
    const html = pug.renderFile(`${__dirname}/../views/email/verifyCode.pug`, {
      firstName: this.firstName,
      subject,
      code,
      isReset: typeCode === "resetPassword",
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendLogged(ip, type, device) {
    const html = pug.renderFile(`${__dirname}/../views/email/logged.pug`, {
      firstName: this.firstName,
      ip,
      type,
      device,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: "Вход в аккаунт",
      html,
      text: htmlToText.convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
};
