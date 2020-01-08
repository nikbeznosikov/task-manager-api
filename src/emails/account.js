const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'nikitabeznosikov@gmail.com',
    subject: 'Welcome to the app',
    text: `Welcome to the app, ${name}. Let me know how is your experience.`,
  });
};

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'nikitabeznosikov@gmail.com',
    subject: 'Your account was deleted',
    text: `Hi ${name}. We deleted your account from our app. If you want please provide your app experience.`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};