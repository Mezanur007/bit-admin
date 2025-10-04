"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useContent } from "@/contexts/ContentContext";

export default function Achievers() {
  const locale = useLocale();
  const t = useTranslations("achievers");
  const c = useTranslations("common");
  const { achieversContent } = useContent();
  const [headline, setHeadline] = useState({ en: "", ar: "" });
  const [copy, setCopy] = useState({ en: "", ar: "" });
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState(locale || "en");

  const handleSaveToFirestore = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "content", "achievers"), {
        headline,
        copy,
      });
      toast.success(c("saveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHeadline(achieversContent.headline);
    setCopy(achieversContent.copy);
  }, [achieversContent]);

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
        <label className="form-label">{t("headline")}</label>
        <input
          className="form-control"
          value={headline[activeLang]}
          onChange={(e) =>
            setHeadline((prev) => ({ ...prev, [activeLang]: e.target.value }))
          }
          dir={activeLang === "ar" ? "rtl" : "ltr"}
        />
      </div>
      <div className="mb-5">
        <label className="form-label">{t("copy")}</label>
        <textarea
          className="form-control"
          rows={3}
          value={copy[activeLang]}
          onChange={(e) =>
            setCopy((prev) => ({ ...prev, [activeLang]: e.target.value }))
          }
          dir={activeLang === "ar" ? "rtl" : "ltr"}
        />
      </div>
      <button
        className="btn btn-success"
        onClick={handleSaveToFirestore}
        disabled={loading}
      >
        {loading ? c("saving") : c("save")}
      </button>
    </div>
  );
}
