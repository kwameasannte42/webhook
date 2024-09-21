const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const ics = require("ics"); // Install this using npm: npm install ics

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Received a ${req.method} request to ${req.url}`);
  next();
});

// Mapping workshops to their details
const workshops = {
  Field5: {
    name: "Wright State University",
    date: "9/11/24",
    time: "12p-1:30p",
    location: "Dayton Campus, Building 10, Rm 009",
  },
  Field6: {
    name: "Western Governors University",
    date: "9/18/24",
    time: "12p-1:30p",
    location: "Dayton Campus, Building 10, Rm 009",
  },
  Field7: {
    name: "Ohio State University",
    date: "9/19/24",
    time: "12p-1:30p",
    location: "Dayton Campus, Building 10, Rm 011",
  },
  Field8: {
    name: "University of Dayton",
    date: "9/25/24",
    time: "12p-1:30p",
    location: "Dayton Campus, Building 10, Rm 009",
  },
  Field9: {
    name: "University of Cincinnati",
    date: "9/26/24",
    time: "12p-1:30p",
    location: "Dayton Campus, Building 10, Rm 009",
  },
};

app.post("/webhook", (req, res) => {
  const formData = req.body;

  const firstName = formData.Field1; // First name
  const lastName = formData.Field2; // Last name
  const email = formData.Field3; // Email

  // Combine first and last name to create full name
  const fullName = `${firstName} ${lastName}`;

  console.log("Received form data:", formData);
  console.log("Name:", fullName);
  console.log("Email:", email);

  // Collect selected workshops based on checkbox fields (Field5 to Field9)
  const selectedWorkshops = [];
  ["Field5", "Field6", "Field7", "Field8", "Field9"].forEach((field) => {
    if (formData[field]) {
      selectedWorkshops.push(workshops[field]);
    }
  });

  console.log("Selected Workshops:", selectedWorkshops);

  // Schedule emails for each selected workshop
  setTimeout(() => {
    selectedWorkshops.forEach((workshop) => {
      sendReminderEmail(fullName, email, workshop);
    });
  }, 2 * 60 * 1000); // 2 minutes delay

  res.status(200).send("Webhook received");
});

function sendReminderEmail(name, email, workshop) {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS, // Gmail App Password
    },
  });

  // Customize email subject and body based on the workshop details
  const subject = `Reminder: ${workshop.name} Happening Soon!`;

  const text = `Dear ${name},\n\n` +
    `This is a friendly reminder that our upcoming ${workshop.name} workshop is just around the corner! ` +
    `We’re excited to have you join us to learn more about the transfer process and how to make the most of your academic journey.\n\n` +
    `Workshop Details:\n\n` +
    `· Date: ${workshop.date}\n` +
    `· Time: ${workshop.time}\n` +
    `· Location: ${workshop.location}\n\n` +
    `If you have questions or need further information, please contact the Transfer Center team at 937-512-2100 ` +
    `or email us at transfercenter@sinclair.edu. You can also check out our website for upcoming events!\n\n` +
    `We look forward to seeing you at the workshop,\n\n` +
    `The Transfer Center Team`;

  const html = `<p>Dear ${name},</p>
    <p>This is a friendly reminder that our upcoming <strong>${workshop.name}</strong> workshop is just around the corner! 
    We’re excited to have you join us to learn more about the transfer process and how to make the most of your academic journey.</p>
    
    <p><strong>Workshop Details:</strong></p>
    <ul>
      <li>Date: ${workshop.date}</li>
      <li>Time: ${workshop.time}</li>
      <li>Location: ${workshop.location}</li>
    </ul>
    
    <p>We look forward to seeing you at the workshop,<br>The Transfer Center Team</p>`;

  // Create the .ics calendar event
  const eventDate = workshop.date.split("/"); // Assuming date is "MM/DD/YY"
  const [month, day, year] = eventDate.map(Number);
  const startTime = workshop.time.split("-")[0].trim().split(":");
  const endTime = workshop.time.split("-")[1].trim().split(":");

  const icsEvent = {
    start: [year, month, day, parseInt(startTime[0]), parseInt(startTime[1])],
    end: [year, month, day, parseInt(endTime[0]), parseInt(endTime[1])],
    title: workshop.name,
    location: workshop.location,
    description: `Join us for the ${workshop.name} workshop at ${workshop.location}.`,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
  };

  ics.createEvent(icsEvent, (error, value) => {
    if (error) {
      console.log("Error creating calendar event:", error);
      return;
    }

    let mailOptions = {
      from: process.env.SMTP_USER, // Sender address
      to: email, // Recipient email address
      subject: subject,
      text: text, // Plain text version
      html: html, // HTML version
      attachments: [
        {
          filename: 'event.ics',
          content: value, // The .ics file content
        },
      ],
    };

    // Send the email with the attached calendar invite
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log(`Reminder email for ${workshop.name} sent to ${email}:`, info.response);
      }
    });
  });
}

// Listen on the port provided by Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
