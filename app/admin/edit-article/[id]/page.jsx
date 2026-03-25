"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useArticles } from "@/contexts/ArticlesContext";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});
import { db, storage } from "@/configuration/firebase-config";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "react-toastify";
import { useRouter, useParams } from "next/navigation";
import { nanoid } from "nanoid";
import { useLocale, useTranslations } from "next-intl";

import Loading from "@/components/Loading";

export default function EditArticle() {
  const params = useParams();
  const { id } = params;
  const locale = useLocale();
  const t = useTranslations("editArticlePage");
  const a = useTranslations("addArticlePage");
  const c = useTranslations("common");
  const router = useRouter();
  const { articles } = useArticles();
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [newImage, setNewImage] = useState(null);

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
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setArticle((prev) => ({
        ...prev,
        image: null,
      }));
      setTimeout(() => {
        e.target.value = "";
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!article) return;
    try {
      setLoading(true);

      let imageUrl = article.image;

      if (newImage) {
        const imageRef = ref(storage, `articles/article-${article.storageId}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const articleRef = doc(db, "articles", id);
      await updateDoc(articleRef, {
        ...article,
        image: imageUrl,
        timestamp: serverTimestamp(),
      });

      toast.success(c("updateSuccess"));
      setNewImage(null);
      router.back();
    } catch (error) {
      console.log("Failed to update the article", error);
      toast.error(c("updateFail"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articles.length > 0) {
      const filteredArticle = articles.find((a) => a.id === id);
      if (filteredArticle) {
        setArticle(filteredArticle);
      } else {
        toast.error("Article not found.");
      }
    }
  }, [id, articles]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return <Loading />;
  }

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
          <label className="form-label mb-3">{a("image")}</label>
          {(article.image || newImage) && (
            <img
              src={article.image || URL.createObjectURL(newImage)}
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
              {c("change")}
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
            {a("title")}
          </label>
          <input
            id="articleTitle"
            type="text"
            className="form-control"
            value={article.title?.[activeLang] || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="articleSlug" className="form-label">
            {c("slug")}
          </label>
          <input
            id="articleSlug"
            type="text"
            className="form-control"
            value={article.slug || ""}
            onChange={(e) => handleChange("slug", e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label className="form-label">{a("description")}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={article.description?.[activeLang] || ""}
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
