import { authAdmin } from "@/configuration/firebase-admin";
import admin from "firebase-admin";

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return new Response(JSON.stringify({ error: "Missing admin UID" }), {
        status: 400,
      });
    }

    await authAdmin.deleteUser(uid);

    const db = admin.firestore();
    await db.collection("admins").doc(uid).delete();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error removing admin:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
