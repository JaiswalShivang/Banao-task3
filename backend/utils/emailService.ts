import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

interface AlertData {
  coinId: string;
  targetPrice: number;
  currentPrice: number;
  condition: string;
}

export const sendAlert = async (email: string, data: AlertData): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Crypto Price Alert: ${data.coinId}`,
      html: `
        <h2>Price Alert Triggered!</h2>
        <p><strong>Coin:</strong> ${data.coinId}</p>
        <p><strong>Condition:</strong> ${data.condition}</p>
        <p><strong>Target Price:</strong> $${data.targetPrice}</p>
        <p><strong>Current Price:</strong> $${data.currentPrice}</p>
        <p>Your alert has been triggered. The price condition you set has been met.</p>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
