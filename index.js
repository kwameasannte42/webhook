const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/webhook", (req, res) => {
  const formData = req.body;
  console.log("Received form data:", formData);

  // Schedule email after 24 hours
  setTimeout(() => {
    sendReminderEmail(formData);
  }, 2 * 60 * 1000); // 24 hours in milliseconds

  res.status(200).send("Webhook received");
});

function sendReminderEmail(data) {
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "kwameasante42@gmail.com",
      pass: "nanakwame40",
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
