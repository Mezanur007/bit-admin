"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";

export default function AboutUs() {
  const locale = useLocale();
  const t = useTranslations("aboutPage");
  const c = useTranslations("common");
  const { about } = useContent();

  const [activeLang, setActiveLang] = useState(locale || "en");
  const [saving, setSaving] = useState(false);

  const defaultData = {
    hero: { headline: { en: "", ar: "" }, copy: { en: "", ar: "" } },
    missionVisionSection: {
      title: { en: "", ar: "" },
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      mission: {
        headline: { en: "", ar: "" },
        copy: { en: "", ar: "" },
        image: { url: "", path: "" },
      },
      vision: {
        headline: { en: "", ar: "" },
        copy: { en: "", ar: "" },
        image: { url: "", path: "" },
      },
    },
    features: [],
    howWeWorkSection: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
    },
    howWeWorkSteps: [],
    cta: {
      copy: { en: "", ar: "" },
      buttonText: { en: "", ar: "" },
    },
    coreValuesSection: {
      title: { en: "", ar: "" },
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
    },
    coreValuesItems: [],
  };

  const [formData, setFormData] = useState(defaultData);
  const [imageFiles, setImageFiles] = useState({ mission: null, vision: null });

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

  const handleAddItem = (section) => {
    setFormData({
      ...formData,
      [section]: [
        ...formData[section],
        {
          id: nanoid(),
          headline: { en: "", ar: "" },
          copy: { en: "", ar: "" },
        },
      ],
    });
  };

  const handleRemoveItem = (section, id) => {
    setFormData({
      ...formData,
      [section]: formData[section].filter((item) => item.id !== id),
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let updatedForm = { ...formData };

      if (imageFiles.mission) {
        const existingPath = formData.missionVisionSection.mission.image.path;
        const uploaded = await handleImageUpload(
          imageFiles.mission,
          existingPath || `content/about/mission-${nanoid()}`
        );
        updatedForm.missionVisionSection.mission.image = {
          ...updatedForm.missionVisionSection.mission.image,
          url: uploaded.url,
          path: uploaded.path,
        };
      }

      if (imageFiles.vision) {
        const existingPath = formData.missionVisionSection.vision.image.path;
        const uploaded = await handleImageUpload(
          imageFiles.vision,
          existingPath || `content/about/vision-${nanoid()}`
        );
        updatedForm.missionVisionSection.vision.image = {
          ...updatedForm.missionVisionSection.vision.image,
          url: uploaded.url,
          path: uploaded.path,
        };
      }

      const docRef = doc(db, "content", "about");
      await updateDoc(docRef, updatedForm);

      toast.success(c("saveSuccess"));
      setFormData(updatedForm);
      setImageFiles({ mission: null, vision: null });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setFormData(about);
  }, [about]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227,227,227,1)",
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
      <h5>{t("hero")}</h5>
      <input
        className="form-control mb-2"
        placeholder="Headline"
        value={formData.hero.headline[activeLang]}
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
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <textarea
        className="form-control mb-3"
        rows={3}
        placeholder="Copy"
        value={formData.hero.copy[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            hero: {
              ...formData.hero,
              copy: { ...formData.hero.copy, [activeLang]: e.target.value },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />

      {/* Mission & Vision Section */}
      <h5>{t("mvSection")}</h5>
      <input
        className="form-control mb-2"
        placeholder="Section Title"
        value={formData.missionVisionSection.title[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            missionVisionSection: {
              ...formData.missionVisionSection,
              title: {
                ...formData.missionVisionSection.title,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <input
        className="form-control mb-2"
        placeholder="Section Headline"
        value={formData.missionVisionSection.headline[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            missionVisionSection: {
              ...formData.missionVisionSection,
              headline: {
                ...formData.missionVisionSection.headline,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <textarea
        className="form-control mb-3"
        rows={3}
        placeholder="Section Copy"
        value={formData.missionVisionSection.copy[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            missionVisionSection: {
              ...formData.missionVisionSection,
              copy: {
                ...formData.missionVisionSection.copy,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />

      {/* Mission */}
      <div className="mb-5">
        <h6>{t("mission")}</h6>
        <input
          className="form-control mb-2"
          placeholder="Mission Headline"
          value={formData.missionVisionSection.mission.headline[activeLang]}
          onChange={(e) =>
            setFormData({
              ...formData,
              missionVisionSection: {
                ...formData.missionVisionSection,
                mission: {
                  ...formData.missionVisionSection.mission,
                  headline: {
                    ...formData.missionVisionSection.mission.headline,
                    [activeLang]: e.target.value,
                  },
                },
              },
            })
          }
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
        <textarea
          className="form-control mb-2"
          rows={3}
          placeholder="Mission Copy"
          value={formData.missionVisionSection.mission.copy[activeLang]}
          onChange={(e) =>
            setFormData({
              ...formData,
              missionVisionSection: {
                ...formData.missionVisionSection,
                mission: {
                  ...formData.missionVisionSection.mission,
                  copy: {
                    ...formData.missionVisionSection.mission.copy,
                    [activeLang]: e.target.value,
                  },
                },
              },
            })
          }
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
        <h6>{t("image")}</h6>
        {(formData.missionVisionSection.mission.image.url ||
          imageFiles.mission) && (
          <div className="mb-3">
            <img
              src={
                imageFiles.mission
                  ? URL.createObjectURL(imageFiles.mission)
                  : formData.missionVisionSection.mission.image.url
              }
              alt="Mission"
              style={{ maxWidth: "200px" }}
            />
          </div>
        )}
        <button
          className="btn btn-outline-primary mb-2"
          onClick={() => document.getElementById("missionFile").click()}
        >
          {formData.missionVisionSection.mission.image.url || imageFiles.mission
            ? c("change")
            : c("add")}
        </button>
        <input
          type="file"
          id="missionFile"
          className="d-none"
          accept="image/*"
          onChange={(e) =>
            setImageFiles({ ...imageFiles, mission: e.target.files[0] || null })
          }
        />
      </div>

      {/* Vision */}
      <div className="mb-5">
        <h6>{t("vision")}</h6>
        <input
          className="form-control mb-2"
          placeholder="Vision Headline"
          value={formData.missionVisionSection.vision.headline[activeLang]}
          onChange={(e) =>
            setFormData({
              ...formData,
              missionVisionSection: {
                ...formData.missionVisionSection,
                vision: {
                  ...formData.missionVisionSection.vision,
                  headline: {
                    ...formData.missionVisionSection.vision.headline,
                    [activeLang]: e.target.value,
                  },
                },
              },
            })
          }
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
        <textarea
          className="form-control mb-2"
          rows={3}
          placeholder="Vision Copy"
          value={formData.missionVisionSection.vision.copy[activeLang]}
          onChange={(e) =>
            setFormData({
              ...formData,
              missionVisionSection: {
                ...formData.missionVisionSection,
                vision: {
                  ...formData.missionVisionSection.vision,
                  copy: {
                    ...formData.missionVisionSection.vision.copy,
                    [activeLang]: e.target.value,
                  },
                },
              },
            })
          }
          dir={activeLang === "en" ? "ltr" : "rtl"}
        />
        <h6>{t("image")}</h6>
        {(formData.missionVisionSection.vision.image.url ||
          imageFiles.vision) && (
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={
                imageFiles.vision
                  ? URL.createObjectURL(imageFiles.vision)
                  : formData.missionVisionSection.vision.image.url
              }
              alt="Vision"
              style={{ maxWidth: "200px" }}
            />
          </div>
        )}
        <button
          className="btn btn-outline-primary mb-2"
          onClick={() => document.getElementById("visionFile").click()}
        >
          {formData.missionVisionSection.vision.image.url || imageFiles.vision
            ? c("change")
            : c("add")}
        </button>
        <input
          type="file"
          id="visionFile"
          className="d-none"
          accept="image/*"
          onChange={(e) =>
            setImageFiles({ ...imageFiles, vision: e.target.files[0] || null })
          }
        />
      </div>

      {/* Features Section */}
      <h5>{t("features")}</h5>
      {formData.features.map((item, idx) => (
        <div key={item.id} className="mb-3 border p-2 rounded">
          <input
            className="form-control mb-1"
            placeholder="Feature Headline"
            value={item.headline[activeLang]}
            onChange={(e) => {
              const updated = [...formData.features];
              updated[idx].headline[activeLang] = e.target.value;
              setFormData({ ...formData, features: updated });
            }}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
          <textarea
            className="form-control mb-2"
            rows={2}
            placeholder="Feature Copy"
            value={item.copy[activeLang]}
            onChange={(e) => {
              const updated = [...formData.features];
              updated[idx].copy[activeLang] = e.target.value;
              setFormData({ ...formData, features: updated });
            }}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleRemoveItem("features", item.id)}
          >
            {t("remove")}
          </button>
        </div>
      ))}
      <button
        className="btn btn-sm btn-outline-primary mb-3"
        onClick={() => handleAddItem("features")}
      >
        {t("addFeature")}
      </button>

      {/* How We Work Section */}
      <h5>{t("howWeWorkSection")}</h5>
      <input
        className="form-control mb-2"
        placeholder="Headline"
        value={formData.howWeWorkSection.headline[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            howWeWorkSection: {
              ...formData.howWeWorkSection,
              headline: {
                ...formData.howWeWorkSection.headline,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <textarea
        className="form-control mb-3"
        rows={3}
        placeholder="Copy"
        value={formData.howWeWorkSection.copy[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            howWeWorkSection: {
              ...formData.howWeWorkSection,
              copy: {
                ...formData.howWeWorkSection.copy,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />

      {formData.howWeWorkSteps.map((step, idx) => (
        <div key={step.id} className="mb-3 border p-2 rounded">
          <input
            className="form-control mb-1"
            placeholder="Step Headline"
            value={step.headline[activeLang]}
            onChange={(e) => {
              const updated = [...formData.howWeWorkSteps];
              updated[idx].headline[activeLang] = e.target.value;
              setFormData({ ...formData, howWeWorkSteps: updated });
            }}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
          <textarea
            className="form-control mb-2"
            rows={2}
            placeholder="Step Copy"
            value={step.copy[activeLang]}
            onChange={(e) => {
              const updated = [...formData.howWeWorkSteps];
              updated[idx].copy[activeLang] = e.target.value;
              setFormData({ ...formData, howWeWorkSteps: updated });
            }}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleRemoveItem("howWeWorkSteps", step.id)}
          >
            {t("remove")}
          </button>
        </div>
      ))}
      <button
        className="btn btn-sm btn-outline-primary mb-3"
        onClick={() => handleAddItem("howWeWorkSteps")}
      >
        {t("addStep")}
      </button>

      {/* CTA Section */}
      <h5>{t("cta")}</h5>
      <textarea
        className="form-control mb-2"
        rows={2}
        placeholder="CTA Copy"
        value={formData.cta.copy[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            cta: {
              ...formData.cta,
              copy: { ...formData.cta.copy, [activeLang]: e.target.value },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <input
        className="form-control mb-3"
        placeholder="CTA Button Text"
        value={formData.cta.buttonText[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            cta: {
              ...formData.cta,
              buttonText: {
                ...formData.cta.buttonText,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />

      {/* Core Values Section */}
      <h5>{t("coreValuesSection")}</h5>
      <input
        className="form-control mb-2"
        placeholder="Section Title"
        value={formData.coreValuesSection.title[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            coreValuesSection: {
              ...formData.coreValuesSection,
              title: {
                ...formData.coreValuesSection.title,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <input
        className="form-control mb-2"
        placeholder="Headline"
        value={formData.coreValuesSection.headline[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            coreValuesSection: {
              ...formData.coreValuesSection,
              headline: {
                ...formData.coreValuesSection.headline,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />
      <textarea
        className="form-control mb-3"
        rows={3}
        placeholder="Copy"
        value={formData.coreValuesSection.copy[activeLang]}
        onChange={(e) =>
          setFormData({
            ...formData,
            coreValuesSection: {
              ...formData.coreValuesSection,
              copy: {
                ...formData.coreValuesSection.copy,
                [activeLang]: e.target.value,
              },
            },
          })
        }
        dir={activeLang === "en" ? "ltr" : "rtl"}
      />

      {formData.coreValuesItems.map((item, idx) => (
        <div key={item.id} className="mb-3 border p-2 rounded">
          <input
            className="form-control mb-2"
            placeholder="Item Headline"
            value={item.headline[activeLang]}
            onChange={(e) => {
              const updated = [...formData.coreValuesItems];
              updated[idx].headline[activeLang] = e.target.value;
              setFormData({ ...formData, coreValuesItems: updated });
            }}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
          <textarea
            className="form-control mb-2"
            rows={2}
            placeholder="Item Copy"
            value={item.copy[activeLang]}
            onChange={(e) => {
              const updated = [...formData.coreValuesItems];
              updated[idx].copy[activeLang] = e.target.value;
              setFormData({ ...formData, coreValuesItems: updated });
            }}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleRemoveItem("coreValuesItems", item.id)}
          >
            {t("remove")}
          </button>
        </div>
      ))}
      <button
        className="btn btn-sm btn-outline-primary mb-3"
        onClick={() => handleAddItem("coreValuesItems")}
      >
        {t("addCoreValue")}
      </button>

      <div className="d-flex justify-content-start mt-5">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? c("saving") : c("save")}
        </button>
      </div>
    </div>
  );
}
