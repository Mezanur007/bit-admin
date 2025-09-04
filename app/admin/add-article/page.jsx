"use client";
import React, { useState, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { nanoid } from "nanoid";
import { db } from "@/configuration/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function AddArticle() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("addArticlePage");
  const c = useTranslations("common");
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [article, setArticle] = useState({
    image: null,
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      height: 400,
      readonly: false,
      direction: activeLang === "ar" ? "rtl" : "ltr",
      placeholder: activeLang === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [activeLang]
  );

  const handleChange = (field, value) => {
    if (field === "title" && value.includes("_")) {
      setError(c("noUnderscores"));
      return;
    } else {
      setError("");
    }

    if (["title", "description"].includes(field)) {
      setArticle((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [activeLang]: value,
        },
      }));
    } else {
      setArticle((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImage = (e) => {
    setArticle((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));

    setTimeout(() => {
      e.target.value = "";
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!article.image) {
        toast.error(c("addImage"));
        return;
      }

      const storageId = nanoid();

      const formData = new FormData();
      formData.append("file", article.image);
      formData.append("path", storageId);
      formData.append("bucket", "bit-blog-images");

      const res = await fetch("/api/image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      const imageURL = data.url;

      const articlesRef = collection(db, "articles");
      await addDoc(articlesRef, {
        ...article,
        storageId,
        image: imageURL,
        timestamp: serverTimestamp(),
      });

      toast.success(c("saveSuccess"));
      router.back();
      setArticle({
        image: null,
        title: { en: "", ar: "" },
        description: { en: "", ar: "" },
      });
    } catch (error) {
      console.log("Failed to add article", error);
      toast.error(
        locale === "ar" ? "فشل في إضافة المقالة" : "Failed to add article"
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
      <h4 className="mb-4">{t("pageTitle")}</h4>

      <div className="mb-5" style={{ maxWidth: "200px" }}>
        <label htmlFor="langSelect" className="form-label">
          {c("langSelect")}
        </label>
        <select
          id="langSelect"
          className="form-select"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="w-md-75">
        <div className="mb-4">
          <label className="form-label mb-3">{t("image")}</label>
          {article.image && (
            <img
              src={URL.createObjectURL(article.image)}
              alt="img"
              style={{ width: "100%", borderRadius: "30px" }}
              className="mb-4"
            />
          )}
          <div className="d-flex mb-3">
            <div
              className="primaryButton text-center rounded"
              onClick={() => document.getElementById("ImgInput").click()}
            >
              {article.image ? c("change") : c("add")}
            </div>
          </div>
          <input
            id="ImgInput"
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
            className="form-control"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="articleTitle" className="form-label">
            {t("title")}
          </label>
          <input
            id="articleTitle"
            type="text"
            className="form-control"
            value={article.title[activeLang]}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
          {error !== "" && <div className="form-text text-danger">{error}</div>}
        </div>
        <div className="mb-5">
          <label className="form-label">{t("description")}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={article.description[activeLang]}
            tabIndex={1}
            onBlur={(newContent) => handleChange("description", newContent)}
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
