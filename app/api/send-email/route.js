import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { subject, body, emails } = await req.json();

    if (!subject || !body || !emails) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    for (const email of emails) {
      await resend.emails.send({
        from: "B-IT <info@b-it.co>",
        to: email,
        subject,
        html: `${body}
      <p style="font-size:14px; color:#555; margin-top:20px;">
        Don’t want to hear from us anymore? 
        <a href="https://b-it.co/en/unsubscribe/${encodeURIComponent(
          email
        )}" style="color:#0066cc;">Unsubscribe</a>
      </p>
    `,
      });
    }

    return NextResponse.json({ message: "Newsletter sent to all subscribers" });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
