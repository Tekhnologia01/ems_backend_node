import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendFolderInvitationEmail = async ({ to, eventName, shareLink }) => {

  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const subject = `You're invited to join the event "${eventName}"`;

    const html = `
      <h3>You've been invited to access the event: <strong>${eventName}</strong></h3>
      <p>Use the following link to access:</p>
      <br/>
      <p>🔗<a href="${shareLink}" target="_blank">
        Click here to access via web app
      </a></p>
      <br/>
      <p>📲 Download our mobile app:</p>
      <ul>
        <li><a href="https://play.google.com/store/apps/details?id=yourapp">Android</a></li>
        <li><a href="https://apps.apple.com/app/yourapp">iOS</a></li>
      </ul>
      <p>If you're not registered yet, sign up and use the link to access the event.</p>
      <hr/>
      <p>Thank you,<br/>Your App Team</p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });

    console.log(`Invitation sent to ${to}`);
  } catch (error) {
    console.error(`Error sending invitation to ${to}:`, error.message);
    throw error;
  }
};
