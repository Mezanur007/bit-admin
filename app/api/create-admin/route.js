import { authAdmin } from "@/configuration/firebase-admin";
import admin from "firebase-admin";

const db = admin.firestore();

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    const userRecord = await authAdmin.createUser({
      email,
      password,
    });

    await authAdmin.setCustomUserClaims(userRecord.uid, { isAdmin: true });

    await db.collection("admins").doc(userRecord.uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return new Response(
      JSON.stringify({ message: `Admin ${name} created successfully` }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
