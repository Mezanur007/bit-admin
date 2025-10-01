"use client";
import React, { useState, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";

export default function AddQuarterly() {
  const locale = useLocale();
  const t = useTranslations("addQuarterly");
  const c = useTranslations("common");
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);

  const bannerInputRef = useRef();
  const imageInputRef = useRef();

  const [newRecord, setNewRecord] = useState({
    name: { en: "", ar: "" },
    designation: { en: "", ar: "" },
    description: { en: "", ar: "" },
    banner: null,
    image: null,
    fromMonth: "",
    toMonth: "",
  });

  const dataChange = (field, value) => {
    if (["fromMonth", "toMonth"].includes(field)) {
      setNewRecord((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setNewRecord((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    }
  };

  const selectBanner = (e) => {
    setNewRecord((prev) => ({
      ...prev,
      banner: e.target.files[0],
    }));

    setTimeout(() => {
      e.target.value = "";
    }, 0);
  };

  const selectImage = (e) => {
    setNewRecord((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));

    setTimeout(() => {
      e.target.value = "";
    }, 0);
  };

  const handleImageUpload = async (file, path) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    formData.append("bucket", "bit-content-images");

    const res = await fetch("/api/image", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return { url: data.url, path };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!newRecord.banner) {
        toast.error(c("addBanner"));
        return;
      }
      if (!newRecord.image) {
        toast.error(c("addImage"));
        return;
      }

      const docId = nanoid();
      let bannerData = null;
      if (newRecord.banner) {
        bannerData = await handleImageUpload(
          newRecord.banner,
          `achievers/quarterly/record-${docId}/banner`
        );
      }
      let imageData = null;
      if (newRecord.image) {
        imageData = await handleImageUpload(
          newRecord.image,
          `achievers/quarterly/record-${docId}/image`
        );
      }

      const docRef = doc(db, "quarterly-achievers", docId);
      await setDoc(docRef, {
        ...newRecord,
        image: imageData,
        banner: bannerData,
      });

      toast.success(c("saveSuccess"));
      setNewRecord({
        name: { en: "", ar: "" },
        designation: { en: "", ar: "" },
        description: { en: "", ar: "" },
        banner: null,
        image: null,
        fromMonth: "",
        toMonth: "",
      });
    } catch (error) {
      console.log("Failed to add record", error);
      toast.error(
        locale === "ar" ? "فشل في إضافة السجل" : "Failed to add record"
      );
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
      <div className="d-flex justify-content-between align-items-center mb-5">
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

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="achName" className="form-label">
            {t("name")}
          </label>
          <input
            id="achName"
            type="text"
            className="form-control"
            value={newRecord.name[activeLang]}
            onChange={(e) => dataChange("name", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="achDesignation" className="form-label">
            {t("designation")}
          </label>
          <input
            id="achDesignation"
            type="text"
            className="form-control"
            value={newRecord.designation[activeLang]}
            onChange={(e) => dataChange("designation", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="achDescription" className="form-label">
            {t("description")}
          </label>
          <textarea
            id="achDescription"
            rows={3}
            className="form-control"
            value={newRecord.description[activeLang]}
            onChange={(e) => dataChange("description", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fromMonth" className="form-label">
            {t("fromMonth")}
          </label>
          <input
            type="month"
            className="form-control"
            id="fromMonth"
            value={newRecord.fromMonth}
            onChange={(e) => dataChange("fromMonth", e.target.value)}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="toMonth" className="form-label">
            {t("toMonth")}
          </label>
          <input
            type="month"
            className="form-control"
            id="toMonth"
            value={newRecord.toMonth}
            onChange={(e) => dataChange("toMonth", e.target.value)}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            required
          />
        </div>

        <div className="mt-5 d-flex align-items-center justify-content-between">
          <label className="form-label mb-0">{c("banner")}</label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => bannerInputRef.current.click()}
          >
            {c("selectBanner")}
          </button>
          <input
            type="file"
            accept="image/*"
            className="d-none"
            ref={bannerInputRef}
            onChange={selectBanner}
          />
        </div>
        {newRecord.banner && (
          <img
            src={URL.createObjectURL(newRecord.banner)}
            alt="banner"
            style={{ width: "400px", borderRadius: "12px" }}
            className="mt-4"
          />
        )}

        <div className="mt-5 d-flex align-items-center justify-content-between">
          <label className="form-label mb-0">{c("photo")}</label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => imageInputRef.current.click()}
          >
            {c("selectPhoto")}
          </button>
          <input
            type="file"
            accept="image/*"
            className="d-none"
            ref={imageInputRef}
            onChange={selectImage}
          />
        </div>
        {newRecord.image && (
          <img
            src={URL.createObjectURL(newRecord.image)}
            alt="banner"
            style={{ width: "400px", borderRadius: "12px" }}
            className="mt-4"
          />
        )}

        <button
          type="submit"
          className="primaryButton border-0 mt-5"
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
