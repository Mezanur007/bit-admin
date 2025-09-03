"use client";
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
//import { auth } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";

export default function ChangePassword() {
  const locale = useLocale();
  const t = useTranslations("changePasswordPage");
  const [email, setEmail] = useState("");

  const handleChangePassword = (e) => {
    e.preventDefault();
    //sendPasswordResetEmail(auth, email)
    //  .then(() => {
    //    toast.success(t.successMessage(email));
    //    setEmail("");
    //  })
    //  .catch((error) => toast.error(error.message));
  };

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
        backgroundColor: "white",
      }}
    >
      <form onSubmit={handleChangePassword} className="w-md-75">
        <h4 className="mb-5">{t("pageTitle")}</h4>
        <p>{t("description")}</p>
        <div className="row my-5">
          <div>
            <label htmlFor="email" className="form-label">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              className="form-control"
              style={{ borderRadius: "10px" }}
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="primaryButton"
          style={{ borderWidth: 0, borderRadius: "12px" }}
        >
          {t("sendButton")}
        </button>
      </form>
    </div>
  );
}
