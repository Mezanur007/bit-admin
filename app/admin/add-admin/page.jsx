"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslations, useLocale } from "next-intl";

export default function AddAdmin({ params }) {
  const locale = useLocale();
  const t = useTranslations("addAdmin");
  const c = useTranslations("common");

  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/create-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Response is not valid JSON:", text);
        toast.error("Server returned invalid response");
        return;
      }

      if (res.ok) {
        toast.success(t("success"));
        setAdminData({ name: "", email: "", password: "" });
      } else {
        console.error(data.error);
        toast.error(t("error"));
      }
    } catch (err) {
      console.error("Error adding admin:", err);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t("pageTitle")}</h4>
      <form onSubmit={handleAddAdmin} className="w-md-75">
        <div className="mb-4">
          <label htmlFor="adminName" className="form-label">
            {t("name")}
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={t("namePlaceholder")}
            style={{ borderRadius: "10px" }}
            id="adminName"
            name="name"
            value={adminData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="adminEmail" className="form-label">
            {t("email")}
          </label>
          <input
            type="email"
            className="form-control"
            placeholder={t("emailPlaceholder")}
            style={{ borderRadius: "10px" }}
            id="adminEmail"
            name="email"
            value={adminData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="adminPassword" className="form-label">
            {t("password")}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={visible ? "text" : "password"}
              className="form-control"
              placeholder={t("passwordPlaceholder")}
              style={{ borderRadius: "10px" }}
              id="adminPassword"
              name="password"
              value={adminData.password}
              onChange={handleChange}
              required
            />
            {visible ? (
              <VisibilityIcon
                style={{
                  position: "absolute",
                  top: 7,
                  right: locale === "en" ? 10 : "",
                  left: locale === "ar" ? 10 : "",
                  color: "rgba(134, 141, 151, 1)",
                  cursor: "pointer",
                }}
                onClick={() => setVisible(false)}
              />
            ) : (
              <VisibilityOffIcon
                style={{
                  position: "absolute",
                  top: 7,
                  right: locale === "en" ? 10 : "",
                  left: locale === "ar" ? 10 : "",
                  color: "rgba(134, 141, 151, 1)",
                  cursor: "pointer",
                }}
                onClick={() => setVisible(true)}
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="primaryButton border-0"
          style={{ borderRadius: "12px" }}
        >
          {loading ? (
            <>
              <span
                className={`spinner-border spinner-border-sm ${
                  locale === "en" ? "me-2" : "ms-2"
                }`}
                role="status"
                aria-hidden="true"
              ></span>
              {c("adding")}
            </>
          ) : (
            c("add")
          )}
        </button>
      </form>
    </div>
  );
}
