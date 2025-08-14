import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: Bun.env.EMAIL_HOST,
  port: parseInt(Bun.env.EMAIL_PORT || "587"),
  secure: Bun.env.EMAIL_SECURE === "true",
  auth: {
    user: Bun.env.EMAIL_USER,
    pass: Bun.env.EMAIL_PASSWORD,
  },
});

interface EmailParams {
  email: string;
  username: string;
  verificationCode: string;
  verificationLink?: string; // Optional for link-based verification
}

export const sendVerificationEmail = async ({
  email,
  username,
  verificationCode,
}: EmailParams) => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: #2563eb; font-size: 24px; margin-bottom: 20px; }
        .code { 
          background: #f3f4f6; 
          padding: 10px 15px; 
          font-size: 24px; 
          letter-spacing: 2px; 
          display: inline-block; 
          margin: 15px 0;
          border-radius: 4px;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">Verify Your Email</div>
      <p>Hello ${username},</p>
      <p>Please use this verification code to activate your account:</p>
      <div class="code">${verificationCode}</div>
      <p>The code will expire in 24 hours.</p>
      <div class="footer">
        If you didn't request this, please ignore this email.
      </div>
    </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Chat App" <${Bun.env.EMAIL_FROM}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: htmlTemplate,
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send verification email");
  }
};
