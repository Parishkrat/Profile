import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email, name) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Welcome to Bookmarks App!",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #0f0f0f; color: #e8e8e8; border-radius: 12px;">
          <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">Welcome aboard 👋</h1>
          <p style="font-size: 16px; color: #a0a0a0; margin-bottom: 32px;">Your account is ready. Start saving bookmarks and share them with the world.</p>
          <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard"
            style="display: inline-block; background: #ffffff; color: #000000; padding: 12px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 15px;">
            Go to Dashboard →
          </a>
          <p style="font-size: 13px; color: #555; margin-top: 40px;">— The Bookmarks Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: err };
  }
};
