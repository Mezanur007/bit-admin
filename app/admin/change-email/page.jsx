"use client";
import React, { useState } from "react";
import { use } from "react";
import { verifyBeforeUpdateEmail } from "firebase/auth";
//import useAuth from "@/hooks/UseAuth";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";

export default function ChangeEmail() {
  //  const { user } = useAuth();
  const locale = useLocale();
  const t = useTranslations("changeEmailPage");
  const [email, setEmail] = useState("");

  const handleChangeEmail = (e) => {
    e.preventDefault();
    //verifyBeforeUpdateEmail(user, email)
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
      <form onSubmit={handleChangeEmail} className="w-md-75">
        <h4 className="mb-5">{t("pageTitle")}</h4>
        <p>{t("description")}</p>
        <div className="row my-5">
          <div>
            <label htmlFor="email" className="form-label">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              name="email"
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
