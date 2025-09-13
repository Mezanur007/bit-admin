"use client";
import React, { useState } from "react";
import styles from "@/styles/login.module.css";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { LuAtSign } from "react-icons/lu";
import { GoLock } from "react-icons/go";
import { useLocale, useTranslations } from "next-intl";

export default function ForgotPassword() {
  const locale = useLocale();
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setloading] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setloading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast.success(t("success"));
        setEmail("");
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setloading(false));
  };

  return (
    <div
      className="d-flex align-items-center"
      style={{ minHeight: "calc(100vh - 88px)" }}
    >
      <div className="container py-5">
        <div className="d-flex flex-column align-items-center">
          <div
            className={`px-2 px-sm-4 py-4 d-flex flex-column align-items-center ${styles.formWidth}`}
            style={{
              borderRadius: "25px",
              border: "1px solid rgba(202, 218, 231, 1)",
              background:
                "linear-gradient(180deg, #E2F2FF 0%, rgba(255, 255, 255, 0) 78.01%)",
            }}
          >
            <div
              className="d-flex justify-content-center align-items-center mb-4"
              style={{
                width: "61px",
                height: "61px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0px 0px 16.15px 0px rgba(0, 0, 0, 0.07)",
              }}
            >
              <GoLock style={{ width: "30px", height: "30px" }} />
            </div>
            <div
              className="fs-4 text-center mb-2"
              style={{ fontWeight: "600" }}
            >
              {t("pageTitle")}
            </div>
            <div
              className="text-secondary text-center mb-4"
              style={{ fontSize: "14px" }}
            >
              {t("subtitle")}
            </div>
            <form className="w-100" onSubmit={handleForgotPassword}>
              <div className="mb-3 position-relative">
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: locale === "en" ? "8px" : "",
                    right: locale === "ar" ? "8px" : "",
                  }}
                >
                  <LuAtSign
                    style={{
                      width: "19px",
                      height: "19px",
                      color: "rgba(135, 135, 135, 1)",
                    }}
                  />
                </div>
                <input
                  type="email"
                  className="form-control"
                  style={{
                    borderRadius: "15px",
                    paddingRight: locale === "ar" ? "35px" : "",
                    paddingLeft: locale === "en" ? "35px" : "",
                    height: "50px",
                  }}
                  placeholder={t("emailPlaceholder")}
                  id="userEmail"
                  name="email"
                  aria-describedby="emailHelp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="primaryButton w-100"
                style={{ borderWidth: 0, borderRadius: "15px", height: "44px" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </>
                ) : (
                  <>{t("send")}</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
