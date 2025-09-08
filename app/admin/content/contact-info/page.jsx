"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";

export default function ContactInfo() {
  const locale = useLocale();
  const t = useTranslations("contactInfo");
  const c = useTranslations("common");
  const { contactInfo } = useContent();
  const [loading, setLoading] = useState(false);

  const [activeLang, setActiveLang] = useState(locale || "en");

  const [formData, setFormData] = useState({
    phone: "",
    phone1: "",
    email: "",
    address: { en: "", ar: "" },
  });

  const handleChange = (field, value) => {
    if (field === "address") {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "content", "contactInfo");
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
    setFormData(contactInfo);
  }, [contactInfo]);

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
        <label className="form-label">{t("phone")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("phone1")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.phone1}
          onChange={(e) => handleChange("phone1", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">{t("email")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("address")}</label>
        <input
          type="text"
          className="form-control"
          value={formData.address[activeLang]}
          onChange={(e) => handleChange("address", e.target.value)}
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
