import { NextResponse } from "next/server";
import Resend from "resend";

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

    const BATCH_SIZE = 100;
    let start = 0;

    while (start < emails.length) {
      const batch = emails.slice(start, start + BATCH_SIZE);

      await Promise.all(
        batch.map(async (email) => {
          try {
            await resend.emails.send({
              from: "info@b-it.co",
              to: email,
              subject,
              html: body,
            });
          } catch (err) {
            console.error(`Failed to send to ${email}:`, err);
          }
        })
      );

      start += BATCH_SIZE;
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
