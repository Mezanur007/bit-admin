"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";

export default function ContactUs() {
  const locale = useLocale();
  const t = useTranslations("contactUs");
  const c = useTranslations("common");
  const { contactUs } = useContent();
  const [loading, setLoading] = useState(false);

  const [activeLang, setActiveLang] = useState(locale || "en");

  const [formData, setFormData] = useState({
    heroHeadline: { en: "", ar: "" },
    heroCopy: { en: "", ar: "" },
    contactHeadline: { en: "", ar: "" },
    contactCopy: { en: "", ar: "" },
    ctaHeadline: { en: "", ar: "" },
    ctaCopy: { en: "", ar: "" },
    ctaButton: { en: "", ar: "" },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "content", "contactUs");
      await updateDoc(docRef, formData);
      toast.success(c("saveSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(c("error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData(contactUs);
  }, [contactUs]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t("pageTitle")}</h4>
        <select
          className="form-select w-auto"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">{t("heroHeadline")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.heroHeadline[activeLang]}
          onChange={(e) => handleChange("heroHeadline", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("heroCopy")}</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.heroCopy[activeLang]}
          onChange={(e) => handleChange("heroCopy", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t("contactHeadline")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.contactHeadline[activeLang]}
          onChange={(e) => handleChange("contactHeadline", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("contactCopy")}</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.contactCopy[activeLang]}
          onChange={(e) => handleChange("contactCopy", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t("ctaHeadline")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.ctaHeadline[activeLang]}
          onChange={(e) => handleChange("ctaHeadline", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("ctaCopy")}</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.ctaCopy[activeLang]}
          onChange={(e) => handleChange("ctaCopy", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("ctaButton")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.ctaButton[activeLang]}
          onChange={(e) => handleChange("ctaButton", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>

      <button
        className="primaryButton border-0 rounded"
        onClick={handleSave}
        disabled={loading}
      >
        {c("save")}
      </button>
    </div>
  );
}
