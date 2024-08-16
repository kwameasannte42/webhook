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

  const firstName = formData.Field15; // Assuming 'Field15' contains the first name
  const lastName = formData.Field16; // Assuming 'Field16' contains the last name
  const email = formData.Field13; // Assuming 'Field13' contains the email address

  // Combine first and last name to create full name
  const fullName = `${firstName} ${lastName}`;

  console.log("Received form data:", formData);
  console.log("Name:", fullName);
  console.log("Email:", email);

  // Schedule email after 2 minutes
  setTimeout(() => {
    sendReminderEmail(formData);
  }, 2 * 60 * 1000); // 2 minutes in milliseconds

  res.status(200).send("Webhook received");
});

function sendReminderEmail(name, email) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // App Password or SMTP password
    },
  });

  let mailOptions = {
    from: process.env.SMTP_USER, // Sender address
    to: email, // Recipient email address
    subject: "Reminder: Follow-Up Required",
    text: `Hello ${name},\n\nThis is a reminder to follow up on your recent submission.`,
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
