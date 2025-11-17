import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const otpCache = {};

// Store OTP with expiry (default: 10 minutes)
export const storeOtpInMemory = (email, otp, expiryInMs = 600000) => {
  otpCache[email] = { otp, expirationTime: Date.now() + expiryInMs };
  console.log(`OTP stored for ${email}:`, otpCache[email]);
};

// // Global or module-level
export const verifiedUsers = {};
// // Verify OTP from memory

export const checkOtpInMemory = (email, inputOtp) => {
  const record = otpCache[email];

  if (
    record &&
    Date.now() <= record.expirationTime &&
    record.otp === inputOtp
  ) {
    delete otpCache[email]; // Clean up OTP
    verifiedUsers[email] = true; // Mark as verified in a separate place
    return true;
  }

  return false;
};

// Send OTP via Mailtrap
export const sendMailtrapEmail = async (to, subject, text, html = "") => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

// Send OTP to email
export const sendOtpToEmail = async (email, otp) => {
  storeOtpInMemory(email, otp);

  const subject = "Your OTP Code";
  const text = `Your OTP is: ${otp}. It expires in 10 minutes.`;

  await sendMailtrapEmail(email, subject, text);
};
