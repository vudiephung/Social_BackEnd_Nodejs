const sgMail = require("@sendgrid/mail");

require("dotenv").config();

const sendgridAPIKey = process.env.SENDGRID_APIKEY;

sgMail.setApiKey(sendgridAPIKey);

exports.sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: " hungvudiep@social.io",
    subject: "Thank you for joining in!",
    text: `Welcome to the Social App, ${name}. Let  me know how you get along with the app.`
  });
};
