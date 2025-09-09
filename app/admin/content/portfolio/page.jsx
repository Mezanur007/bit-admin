"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";

export default function PortfolioPage() {
  const locale = useLocale();
  const t = useTranslations("portfolio");
  const c = useTranslations("common");
  const { portfolio } = useContent();

  const [activeLang, setActiveLang] = useState(locale || "en");
  const [formData, setFormData] = useState(portfolio);
  const [saving, setSaving] = useState(false);

  const portfolioDocRef = doc(db, "content", "portfolio");

  useEffect(() => {
    setFormData(portfolio);
  }, [portfolio]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateDoc(portfolioDocRef, formData);
      toast.success(c("saveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file, path) => {
    if (!file) return { url: "", path: "" };
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    formData.append("bucket", "bit-content-images");

    const res = await fetch("/api/image", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return { url: data.url, path };
  };

  // -------- Category Management --------
  const addCategory = () => {
    const newCategory = { id: nanoid(), name: { en: "", ar: "" } };
    setFormData({
      ...formData,
      categories: [...(formData?.categories || []), newCategory],
    });
  };

  const updateCategory = (i, lang, value) => {
    const newCategories = [...(formData?.categories || [])];
    newCategories[i] = {
      ...newCategories[i],
      name: { ...newCategories[i].name, [lang]: value },
    };
    setFormData({ ...formData, categories: newCategories });
  };

  const deleteCategory = (id) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c.id !== id),
    });
  };

  // -------- Project Management --------
  const addProject = () => {
    const newProject = {
      id: nanoid(),
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      image: { url: "", path: "" },
      link: "",
      category: "",
    };
    setFormData({
      ...formData,
      projects: [...(formData?.projects || []), newProject],
    });
  };

  const updateProjectField = (i, field, value, lang = null) => {
    const newProjects = [...(formData?.projects || [])];
    if (lang) {
      newProjects[i][field][lang] = value;
    } else {
      newProjects[i][field] = value;
    }
    setFormData({ ...formData, projects: newProjects });
  };

  const updateProjectImage = async (i, file) => {
    try {
      const path = `portfolio/projects/${formData.projects[i].id}`;
      const uploaded = await handleImageUpload(file, path);
      const newProjects = [...formData.projects];
      newProjects[i].image = uploaded;
      setFormData({ ...formData, projects: newProjects });
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    }
  };

  const deleteProject = (id) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((p) => p.id !== id),
    });
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

      {/* Hero Section */}
      <div className="mb-4">
        <h5>{t("hero")}</h5>
        <input
          type="text"
          className="form-control mb-2"
          value={formData?.hero?.headline?.[activeLang] || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              hero: {
                ...formData.hero,
                headline: {
                  ...formData.hero.headline,
                  [activeLang]: e.target.value,
                },
              },
            })
          }
        />
        <textarea
          className="form-control"
          rows={2}
          value={formData?.hero?.copy?.[activeLang] || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              hero: {
                ...formData.hero,
                copy: { ...formData.hero.copy, [activeLang]: e.target.value },
              },
            })
          }
        />
      </div>

      {/* Categories Section */}
      <div className="mb-4">
        <h5>{t("categories")}</h5>
        {(formData?.categories || []).map((cat, i) => (
          <div key={cat.id} className="d-flex align-items-center mb-2">
            <input
              type="text"
              className="form-control me-2"
              placeholder="English"
              value={cat.name.en}
              onChange={(e) => updateCategory(i, "en", e.target.value)}
            />
            <input
              type="text"
              className="form-control me-2"
              placeholder="Arabic"
              value={cat.name.ar}
              onChange={(e) => updateCategory(i, "ar", e.target.value)}
            />
            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteCategory(cat.id)}
            >
              {c("delete")}
            </button>
          </div>
        ))}
        <button className="btn btn-sm btn-outline-primary" onClick={addCategory}>
          {c("add")}
        </button>
      </div>

      {/* Projects Section */}
      <div className="mb-4">
        <h5>{t("projects")}</h5>
        {(formData?.projects || []).map((p, i) => (
          <div key={p.id} className="card p-3 mb-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Headline"
              value={p.headline?.[activeLang] || ""}
              onChange={(e) =>
                updateProjectField(i, "headline", e.target.value, activeLang)
              }
            />
            <textarea
              className="form-control mb-2"
              rows={2}
              placeholder="Copy"
              value={p.copy?.[activeLang] || ""}
              onChange={(e) =>
                updateProjectField(i, "copy", e.target.value, activeLang)
              }
            />
            <input
              type="url"
              className="form-control mb-2"
              placeholder="Link"
              value={p.link || ""}
              onChange={(e) => updateProjectField(i, "link", e.target.value)}
            />
            <select
              className="form-select mb-2"
              value={p.category || ""}
              onChange={(e) => updateProjectField(i, "category", e.target.value)}
            >
              <option value="">{c("selectCategory")}</option>
              {(formData?.categories || []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name[activeLang]}
                </option>
              ))}
            </select>
            <div className="mb-2">
              {p.image?.url && (
                <img
                  src={p.image.url}
                  alt=""
                  style={{ maxWidth: "200px", display: "block", marginBottom: "8px" }}
                />
              )}
              <input
                type="file"
                onChange={(e) =>
                  updateProjectImage(i, e.target.files?.[0] || null)
                }
              />
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => deleteProject(p.id)}
            >
              {c("delete")}
            </button>
          </div>
        ))}
        <button className="btn btn-sm btn-outline-primary" onClick={addProject}>
          {c("add")}
        </button>
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : c("save")}
      </button>
    </div>
  );
}
