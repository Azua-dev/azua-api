const express = require("express");
const passport = require("passport");
const nodemailer = require("nodemailer");
const Session = require("../models/Session");
const router = express.Router();

// Send Welcome Email to New Users
const sendWelcomeEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Azua.dev!",
    text: `Dear ${name},

We are thrilled to welcome you to Azua.dev, the premier network for elite developers!

At Azua.dev, we are committed to providing a platform where top developers can connect, collaborate, and grow together. Our community is dedicated to fostering innovation, sharing knowledge, and driving success.

As a valued member of our community, you can expect:

- Access to exclusive resources and events
- Opportunities to connect with fellow developers and industry leaders
- A platform to showcase your skills and projects
- Regular updates on industry trends and best practices

We are excited to have you on board and look forward to seeing the amazing things you will achieve!

If you have any questions or need assistance, please don't hesitate to reach out. Our support team is always here to help.

Best regards,
Azua.dev Team`,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Send New Session Notification Email
const sendNewSessionEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "New Sign-In Detected on Your Azua.dev Account",
    text: `Hi ${name},

We noticed a new sign-in to your Azua.dev account. If this was you, no further action is required.

If you didn't sign in or suspect any unauthorized access, please reset your password immediately and contact our support team.

Stay secure,
Azua.dev Team`,
  };

  try {
    await transporter.sendMail(message);
    console.log(`New session email sent to ${email}`);
  } catch (error) {
    console.error("Error sending session email:", error);
  }
};

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    const { id, email, name } = req.user;

    try {
      // Check if session exists
      const existingSession = await Session.findOne({ userId: id });
      if (existingSession) {
        // Existing session: Notify user of a new session
        sendNewSessionEmail(email, name);
      } else {
        // New user or first session: Welcome user
        await Session.create({ userId: id, email, createdAt: new Date() });
        sendWelcomeEmail(email, name);
      }

      res.redirect("/"); // Redirect to the frontend
    } catch (error) {
      console.error("Error handling Google callback:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// GitHub OAuth Callback
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    const { id, email, name } = req.user;

    try {
      // Check if session exists
      const existingSession = await Session.findOne({ userId: id });
      if (existingSession) {
        // Existing session: Notify user of a new session
        sendNewSessionEmail(email, name);
      } else {
        // New user or first session: Welcome user
        await Session.create({ userId: id, email, createdAt: new Date() });
        sendWelcomeEmail(email, name);
      }

      res.redirect("/"); // Redirect to the frontend
    } catch (error) {
      console.error("Error handling GitHub callback:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
