"use client";
import React, { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db, storage } from "@/configuration/firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";

export default function EditMonthly() {
  const { monthly } = useContent();
  const locale = useLocale();
  const t = useTranslations("addQuarterly");
  const p = useTranslations("editMonthly");
  const c = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const recordId = params.id;

  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);

  const bannerInputRef = useRef();
  const imageInputRef = useRef();

  const [record, setRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    name: { en: "", ar: "" },
    designation: { en: "", ar: "" },
    achievement: { en: "", ar: "" },
    description: { en: "", ar: "" },
    image: null,
    month: "",
  });

  const dataChange = (field, value) => {
    if (["month"].includes(field)) {
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

  const selectImage = (e) => {
    setNewRecord((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
    setTimeout(() => (e.target.value = ""), 0);
  };

  const handleImageUpload = async (file, path) => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, path };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let imageData = newRecord.image;
      if (newRecord.image instanceof File) {
        imageData = await handleImageUpload(
          newRecord.image,
          `achievers/monthly/record-${recordId}/image`
        );
      }

      const docRef = doc(db, "monthly-achievers", recordId);
      await updateDoc(docRef, {
        ...newRecord,
        image: imageData,
      });

      toast.success(c("updateSuccess"));
      router.back();
    } catch (error) {
      console.error("Failed to update record", error);
      toast.error(
        locale === "ar" ? "فشل في تحديث السجل" : "Failed to update record"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const record = monthly.find((q) => q.id === recordId);
    if (record) {
      setRecord(record);
      setNewRecord({
        name: record.name,
        designation: record.designation,
        achievement: record.achievement || { en: "", ar: "" },
        description: record.description,
        image: record.image,
        month: record.month,
      });
    }
  }, [recordId, monthly]);

  if (!record) return <Loading />;

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
        <h4>{p("pageTitle")}</h4>
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
          <label className="form-label">{t("name")}</label>
          <input
            type="text"
            className="form-control"
            value={newRecord.name[activeLang]}
            onChange={(e) => dataChange("name", e.target.value)}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">{t("designation")}</label>
          <input
            type="text"
            className="form-control"
            value={newRecord.designation[activeLang]}
            onChange={(e) => dataChange("designation", e.target.value)}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="achAchievement" className="form-label">
            {t("achievement")}
          </label>
          <input
            id="achAchievement"
            type="text"
            className="form-control"
            value={newRecord.achievement[activeLang]}
            onChange={(e) => dataChange("achievement", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">{t("description")}</label>
          <textarea
            rows={3}
            className="form-control"
            value={newRecord.description[activeLang]}
            onChange={(e) => dataChange("description", e.target.value)}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            required
          />
        </div>

        <div className="mb-4">
          <label className="form-label">{p("month")}</label>
          <input
            type="month"
            className="form-control"
            value={newRecord.month}
            onChange={(e) => dataChange("month", e.target.value)}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
            required
          />
        </div>

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
            src={
              newRecord.image instanceof File
                ? URL.createObjectURL(newRecord.image)
                : newRecord.image.url
            }
            alt="photo"
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
              {c("updating")}
            </>
          ) : (
            c("update")
          )}
        </button>
      </form>
    </div>
  );
}
