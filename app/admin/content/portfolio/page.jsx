"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

export default function PortfolioPage() {
  const locale = useLocale();
  const t = useTranslations("portfolio");
  const c = useTranslations("common");
  const { portfolio } = useContent();
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [formData, setFormData] = useState({
    hero: { headline: { en: "", ar: "" }, copy: { en: "", ar: "" } },
    categories: [],
    projects: [],
    howWeWork: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      items: [],
    },
    cta: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      button1: { en: "", ar: "" },
      button2: { en: "", ar: "" },
    },
  });
  const [deletedProjects, setDeletedProjects] = useState([]);
  const [openSections, setOpenSections] = useState({
    hero: false,
    categories: false,
    projects: false,
    howWeWork: false,
    cta: false,
  });

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

  const handleChange = (section, field, value, lang = activeLang) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { ...prev[section][field], [lang]: value },
      },
    }));
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: nanoid(), title: { en: "", ar: "" } },
      ],
    }));
  };

  const updateCategory = (id, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === id ? { ...cat, title: { ...cat.title, [lang]: value } } : cat
      ),
    }));
  };

  const removeCategory = (id) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      projects: prev.projects.map((p) =>
        p.category === id ? { ...p, category: "" } : p
      ),
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: nanoid(),
          headline: { en: "", ar: "" },
          copy: { en: "", ar: "" },
          image: { url: "", path: "" },
          tempFile: null,
          link: "",
          category: "",
        },
      ],
    }));
  };

  const deleteProject = (id) => {
    const projectToDelete = formData.projects.find((p) => p.id === id);
    if (!projectToDelete) return;

    setDeletedProjects((prev) => [...prev, projectToDelete]);

    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const updateProject = (id, field, value, lang = activeLang) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id
          ? field === "image" ||
            field === "link" ||
            field === "category" ||
            field === "tempFile"
            ? { ...p, [field]: value }
            : { ...p, [field]: { ...p[field], [lang]: value } }
          : p
      ),
    }));
  };

  const addHowWeWorkItem = () => {
    setFormData((prev) => ({
      ...prev,
      howWeWork: {
        ...prev.howWeWork,
        items: [
          ...prev.howWeWork.items,
          {
            id: nanoid(),
            headline: { en: "", ar: "" },
            copy: { en: "", ar: "" },
            points: [],
          },
        ],
      },
    }));
  };

  const updateHowWeWorkItem = (id, field, value, lang = activeLang) => {
    setFormData((prev) => ({
      ...prev,
      howWeWork: {
        ...prev.howWeWork,
        items: prev.howWeWork.items.map((i) =>
          i.id === id
            ? {
                ...i,
                [field]:
                  field === "points" ? value : { ...i[field], [lang]: value },
              }
            : i
        ),
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      if (deletedProjects.length > 0) {
        await Promise.all(
          deletedProjects.map(async (p) => {
            if (p.image?.path) {
              const resImg = await fetch(`/api/image`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  bucket: "bit-content-images",
                  path: p.image.path,
                }),
              });
              if (!resImg.ok) throw new Error("Failed to delete image");
            }
          })
        );
        setDeletedProjects([]);
      }

      const updatedProjects = await Promise.all(
        formData.projects.map(async (p) => {
          if (p.tempFile) {
            const img = await handleImageUpload(
              p.tempFile,
              `content/portfolio/${p.id}`
            );
            return { ...p, image: img, tempFile: null };
          }
          return p;
        })
      );

      const payload = { ...formData, projects: updatedProjects };

      await updateDoc(doc(db, "content", "portfolio"), payload);
      toast.success("Portfolio content updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    setFormData(portfolio);
  }, [portfolio]);

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

      <div className="mb-4 border rounded">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("hero")}
        >
          <h5 className="mb-0">{t("hero")}</h5>
          {openSections.hero ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.hero && (
          <div className="p-3">
            <input
              className="form-control mb-2"
              placeholder="Headline"
              value={formData.hero.headline[activeLang]}
              onChange={(e) => handleChange("hero", "headline", e.target.value)}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <textarea
              className="form-control"
              placeholder="Copy"
              value={formData.hero.copy[activeLang]}
              onChange={(e) => handleChange("hero", "copy", e.target.value)}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
          </div>
        )}
      </div>

      <div className="mb-4 border rounded">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("categories")}
        >
          <h5 className="mb-0">{t("categories")}</h5>
          {openSections.categories ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.categories && (
          <div className="p-3">
            <ul className="list-group mb-2">
              {formData.categories.map((cat) => (
                <li key={cat.id} className="list-group-item">
                  <div className="mb-2">
                    <input
                      className="form-control mb-1"
                      dir="ltr"
                      placeholder={t("title_en")}
                      value={cat.title.en}
                      onChange={(e) =>
                        updateCategory(cat.id, "en", e.target.value)
                      }
                    />
                    <input
                      className="form-control"
                      dir="rtl"
                      placeholder={t("title_ar")}
                      value={cat.title.ar}
                      onChange={(e) =>
                        updateCategory(cat.id, "ar", e.target.value)
                      }
                    />
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeCategory(cat.id)}
                  >
                    {c("delete")}
                  </button>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={addCategory}>
              {t("addCategory")}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 border rounded">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("projects")}
        >
          <h5 className="mb-0">{t("projects")}</h5>
          {openSections.projects ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.projects && (
          <div className="p-3">
            {formData.projects.map((p) => (
              <div key={p.id} className="border p-3 mb-4 rounded">
                <div className="d-flex justify-content-end mb-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => deleteProject(p.id)}
                  >
                    {c("delete")}
                  </button>
                </div>
                <input
                  className="form-control mb-2"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  placeholder="Headline"
                  value={p.headline[activeLang]}
                  onChange={(e) =>
                    updateProject(p.id, "headline", e.target.value)
                  }
                />
                <textarea
                  className="form-control mb-2"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  placeholder="Copy"
                  value={p.copy[activeLang]}
                  onChange={(e) => updateProject(p.id, "copy", e.target.value)}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  placeholder="Link"
                  value={p.link}
                  onChange={(e) => updateProject(p.id, "link", e.target.value)}
                />

                <select
                  className="form-select mb-2"
                  value={p.category}
                  onChange={(e) =>
                    updateProject(p.id, "category", e.target.value)
                  }
                >
                  <option value="">{t("selectCategory")}</option>
                  {formData.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title[activeLang]}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  id={`file-${p.id}`}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    updateProject(p.id, "tempFile", e.target.files[0])
                  }
                />

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() =>
                    document.getElementById(`file-${p.id}`).click()
                  }
                >
                  {p.tempFile || p.image?.url
                    ? t("changeImage")
                    : t("selectImage")}
                </button>
                {(p.tempFile || p.image?.url) && (
                  <div className="mt-2">
                    <img
                      src={
                        p.tempFile
                          ? URL.createObjectURL(p.tempFile)
                          : p.image.url
                      }
                      alt="preview"
                      style={{ width: "120px", borderRadius: "6px" }}
                    />
                  </div>
                )}
              </div>
            ))}
            <button className="btn btn-primary mt-2" onClick={addProject}>
              {t("addProject")}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 border rounded">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("howWeWork")}
        >
          <h5 className="mb-0">{t("howWeWork")}</h5>
          {openSections.howWeWork ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.howWeWork && (
          <div className="p-3">
            <input
              className="form-control mb-2"
              placeholder="Headline"
              value={formData.howWeWork.headline[activeLang]}
              onChange={(e) =>
                handleChange("howWeWork", "headline", e.target.value)
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <textarea
              className="form-control mb-2"
              placeholder="Copy"
              value={formData.howWeWork.copy[activeLang]}
              onChange={(e) =>
                handleChange("howWeWork", "copy", e.target.value)
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="fw-bold mb-2">{t("steps")}</label>
            {formData.howWeWork.items.map((i) => (
              <div key={i.id} className="border p-3 mb-2 rounded">
                <input
                  className="form-control mb-2"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  placeholder="Item Headline"
                  value={i.headline[activeLang]}
                  onChange={(e) =>
                    updateHowWeWorkItem(i.id, "headline", e.target.value)
                  }
                />
                <textarea
                  className="form-control mb-2"
                  dir={activeLang === "ar" ? "rtl" : "ltr"}
                  placeholder="Item Copy"
                  value={i.copy[activeLang]}
                  onChange={(e) =>
                    updateHowWeWorkItem(i.id, "copy", e.target.value)
                  }
                />
                <div className="mb-2">
                  <label className="fw-bold mb-2">{t("points")}</label>
                  {i.points.map((point, idx) => (
                    <div key={idx} className="d-flex align-items-center mb-2">
                      <input
                        className="form-control me-2"
                        dir={activeLang === "ar" ? "rtl" : "ltr"}
                        value={point[activeLang]}
                        onChange={(e) => {
                          const newPoints = [...i.points];
                          newPoints[idx][activeLang] = e.target.value;
                          updateHowWeWorkItem(i.id, "points", newPoints);
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          const newPoints = i.points.filter(
                            (_, pIdx) => pIdx !== idx
                          );
                          updateHowWeWorkItem(i.id, "points", newPoints);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-block"
                    onClick={() =>
                      updateHowWeWorkItem(i.id, "points", [
                        ...i.points,
                        { en: "", ar: "" },
                      ])
                    }
                  >
                    {t("addPoint")}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary"
              onClick={addHowWeWorkItem}
            >
              {t("addItem")}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("cta")}
        >
          <h5 className="mb-0">{t("cta")}</h5>
          {openSections.cta ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.cta && (
          <div className="p-3">
            <input
              className="form-control mb-2"
              placeholder="Headline"
              value={formData.cta.headline[activeLang]}
              onChange={(e) => handleChange("cta", "headline", e.target.value)}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <textarea
              className="form-control mb-2"
              placeholder="Copy"
              value={formData.cta.copy[activeLang]}
              onChange={(e) => handleChange("cta", "copy", e.target.value)}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <input
              className="form-control mb-2"
              placeholder="Button 1"
              value={formData.cta.button1[activeLang]}
              onChange={(e) => handleChange("cta", "button1", e.target.value)}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <input
              className="form-control"
              placeholder="Button 2"
              value={formData.cta.button2[activeLang]}
              onChange={(e) => handleChange("cta", "button2", e.target.value)}
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
          </div>
        )}
      </div>

      <div className="d-flex justify-content-start">
        <button
          className="btn btn-success border-0 rounded"
          onClick={handleSave}
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
              {c("saving")}
            </>
          ) : (
            t("saveAll")
          )}
        </button>
      </div>
    </div>
  );
}
