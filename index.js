const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Received a ${req.method} request to ${req.url}`);
  next();
});

app.post("/webhook", (req, res) => {
  const formData = req.body;
  console.log("Received form data:", formData);

  // Schedule email after 2 minutes
  setTimeout(() => {
    sendReminderEmail(formData);
  }, 2 * 60 * 1000); // 2 minutes in milliseconds

  res.status(200).send("Webhook received");
});

function sendReminderEmail(data) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER, // It's better to use environment variables for credentials
      pass: process.env.SMTP_PASS, // Never hardcode sensitive information
    },
  });

  let mailOptions = {
    from: "kwameasante42@gmail.com",
    to: data.Email, // Assuming 'Email' is the field name in Wufoo
    subject: "Reminder: Follow-Up Required",
    text: `Hello ${data.Name},\n\nThis is a reminder to follow up on your recent submission.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Reminder email sent:", info.response);
    }
  });
}

// Listen on the port provided by Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
