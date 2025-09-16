"use client";
import React, { useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";
import { useContent } from "@/contexts/ContentContext";

export default function SendNewsletter() {
  const locale = useLocale();
  const t = useTranslations("sendLetter");
  const c = useTranslations("common");
  const { newsletter } = useContent();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subject: "", body: "" });

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      height: 600,
      readonly: false,
      direction: locale === "ar" ? "rtl" : "ltr",
      placeholder: locale === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [locale]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newsletter?.subscribers?.length) {
        toast.info(t("noSubscribers"));
        return;
      }

      setLoading(true);

      const emails = newsletter.subscribers.map((sub) => sub.email);

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.subject,
          body: formData.body,
          emails,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(t("sendSuccess"));
        setFormData({ subject: "", body: "" });
      } else {
        console.error("Send email error:", data);
        toast.error(data.error || "Failed to send newsletter");
      }
    } catch (error) {
      console.error("Failed to send the newsletter", error);
      toast.error("Failed to send newsletter");
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
      <h4 className="mb-4">{t("pageTitle")}</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="subject" className="form-label">
            {t("subject")}
          </label>
          <input
            id="subject"
            type="text"
            className="form-control"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            required
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
        </div>
        <div className="mb-5">
          <label className="form-label">{t("body")}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={formData.body}
            tabIndex={1}
            onBlur={(content) =>
              setFormData((prev) => ({ ...prev, body: content }))
            }
            onChange={() => {}}
          />
        </div>
        <button
          type="submit"
          className="primaryButton border-0"
          style={{ borderRadius: "12px" }}
          disabled={loading}
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
              {t("sending")}
            </>
          ) : (
            t("send")
          )}
        </button>
      </form>
    </div>
  );
}
