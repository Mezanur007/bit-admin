"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { nanoid } from "nanoid";
import { useContent } from "@/contexts/ContentContext";

export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations("home");
  const c = useTranslations("common");
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const { homeData } = useContent();

  const defaultData = {
    hero: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      buttonText: { en: "", ar: "" },
    },
    highlights: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      items: [],
    },
    security: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      points: [],
    },
    marketLeader: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      items: [],
      findMoreText: { en: "", ar: "" },
    },
    aboutSection: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      points: [],
      projects: { count: 0, text: { en: "", ar: "" } },
      members: { count: 0, text: { en: "", ar: "" } },
      experience: { count: 0, text: { en: "", ar: "" } },
      clients: { count: 0, text: { en: "", ar: "" } },
    },
    specialServices: {
      headline: { en: "", ar: "" },
      services: [],
    },
  };

  const [formData, setFormData] = useState(defaultData);

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          [activeLang]: value,
        },
      },
    }));
  };

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "content", "home");
      await updateDoc(ref, formData);
      toast.success(c("saveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save content");
    }
  };

  const addArrayItem = (section, field, template) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], { id: nanoid(), ...template }],
      },
    }));
  };

  const updateArrayItem = (section, field, id, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item) =>
          item.id === id
            ? {
                ...item,
                [key]: {
                  ...item[key],
                  [activeLang]: value,
                },
              }
            : item
        ),
      },
    }));
  };

  const removeArrayItem = (section, field, id) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((item) => item.id !== id),
      },
    }));
  };

  useEffect(() => {
    setFormData(homeData);
  }, [homeData]);

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

      {Object.keys(defaultData).map((section) => (
        <div key={section} className="mb-4 border rounded">
          <div
            className="d-flex align-items-center justify-content-between p-2"
            style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
            onClick={() => toggleSection(section)}
          >
            <h5 className="m-0 text-capitalize">{t(section)}</h5>
            {expanded[section] ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {expanded[section] && (
            <div className="p-3">
              {formData[section].headline && (
                <div className="mb-2">
                  <label>{t("headline")}</label>
                  <input
                    className="form-control"
                    value={formData[section].headline[activeLang] || ""}
                    onChange={(e) =>
                      handleChange(section, "headline", e.target.value)
                    }
                    dir={activeLang === "en" ? "ltr" : "rtl"}
                  />
                </div>
              )}
              {formData[section].copy && (
                <div className="mb-2">
                  <label>{t("copy")}</label>
                  <textarea
                    className="form-control"
                    value={formData[section].copy[activeLang] || ""}
                    onChange={(e) =>
                      handleChange(section, "copy", e.target.value)
                    }
                    dir={activeLang === "en" ? "ltr" : "rtl"}
                  />
                </div>
              )}
              {formData[section].buttonText && (
                <div className="mb-2">
                  <label>{t("buttonText")}</label>
                  <input
                    className="form-control"
                    value={formData[section].buttonText[activeLang] || ""}
                    onChange={(e) =>
                      handleChange(section, "buttonText", e.target.value)
                    }
                    dir={activeLang === "en" ? "ltr" : "rtl"}
                  />
                </div>
              )}
              {formData[section].findMoreText && (
                <div className="mb-2">
                  <label>{t("findMoreText")}</label>
                  <input
                    className="form-control"
                    value={formData[section].findMoreText[activeLang] || ""}
                    onChange={(e) =>
                      handleChange(section, "findMoreText", e.target.value)
                    }
                    dir={activeLang === "en" ? "ltr" : "rtl"}
                  />
                </div>
              )}

              {section === "highlights" && (
                <div>
                  <h6>{t("items")}</h6>
                  {formData.highlights.items.map((item, index) => (
                    <div key={item.id} className="border p-2 mb-2 rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold">
                          {t("item")}. {index + 1}
                        </h6>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            removeArrayItem("highlights", "items", item.id)
                          }
                        >
                          ✕
                        </button>
                      </div>
                      <label>{t("headline")}</label>
                      <input
                        className="form-control mb-1"
                        value={item.headline[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "highlights",
                            "items",
                            item.id,
                            "headline",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                      <label>{t("copy")}</label>
                      <textarea
                        className="form-control mb-1"
                        value={item.copy[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "highlights",
                            "items",
                            item.id,
                            "copy",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                      <div>
                        <h6>{t("points")}</h6>
                        {item.points?.map((pt) => (
                          <div key={pt.id} className="d-flex mb-1">
                            <input
                              className="form-control"
                              value={pt.text[activeLang] || ""}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  highlights: {
                                    ...prev.highlights,
                                    items: prev.highlights.items.map((it) =>
                                      it.id === item.id
                                        ? {
                                            ...it,
                                            points: it.points.map((p) =>
                                              p.id === pt.id
                                                ? {
                                                    ...p,
                                                    text: {
                                                      ...p.text,
                                                      [activeLang]:
                                                        e.target.value,
                                                    },
                                                  }
                                                : p
                                            ),
                                          }
                                        : it
                                    ),
                                  },
                                }));
                              }}
                              dir={activeLang === "en" ? "ltr" : "rtl"}
                            />
                            <button
                              className="btn btn-sm btn-danger ms-2"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  highlights: {
                                    ...prev.highlights,
                                    items: prev.highlights.items.map((it) =>
                                      it.id === item.id
                                        ? {
                                            ...it,
                                            points: it.points.filter(
                                              (p) => p.id !== pt.id
                                            ),
                                          }
                                        : it
                                    ),
                                  },
                                }));
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          className="btn btn-sm btn-outline-primary mt-1"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              highlights: {
                                ...prev.highlights,
                                items: prev.highlights.items.map((it) =>
                                  it.id === item.id
                                    ? {
                                        ...it,
                                        points: [
                                          ...it.points,
                                          {
                                            id: nanoid(),
                                            text: { en: "", ar: "" },
                                          },
                                        ],
                                      }
                                    : it
                                ),
                              },
                            }));
                          }}
                        >
                          {t("addPoint")}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      addArrayItem("highlights", "items", {
                        headline: { en: "", ar: "" },
                        copy: { en: "", ar: "" },
                        points: [],
                      })
                    }
                  >
                    {t("addItem")}
                  </button>
                </div>
              )}

              {section === "security" && (
                <div>
                  <h6>{t("points")}</h6>
                  {formData.security.points.map((pt) => (
                    <div key={pt.id} className="d-flex mb-2">
                      <input
                        className="form-control"
                        value={pt.headline[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "security",
                            "points",
                            pt.id,
                            "headline",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                      <button
                        className="btn btn-sm btn-danger ms-2"
                        onClick={() =>
                          removeArrayItem("security", "points", pt.id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      addArrayItem("security", "points", {
                        headline: { en: "", ar: "" },
                      })
                    }
                  >
                    {t("addPoint")}
                  </button>
                </div>
              )}

              {section === "marketLeader" && (
                <div>
                  <h6>{t("items")}</h6>
                  {formData.marketLeader.items.map((item, index) => (
                    <div key={item.id} className="border p-2 mb-2 rounded">
                      <div className="d-flex justify-content-between">
                        <h6 className="fw-bold">
                          {t("item")}. {index + 1}
                        </h6>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            removeArrayItem("marketLeader", "items", item.id)
                          }
                        >
                          ✕
                        </button>
                      </div>
                      <label>{t("headline")}</label>
                      <input
                        className="form-control mb-1"
                        value={item.headline[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "marketLeader",
                            "items",
                            item.id,
                            "headline",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                      <label>{t("copy")}</label>
                      <textarea
                        className="form-control mb-1"
                        value={item.copy[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "marketLeader",
                            "items",
                            item.id,
                            "copy",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      addArrayItem("marketLeader", "items", {
                        headline: { en: "", ar: "" },
                        copy: { en: "", ar: "" },
                      })
                    }
                  >
                    {t("addItem")}
                  </button>
                </div>
              )}

              {section === "aboutSection" && (
                <div>
                  <h6>{t("points")}</h6>
                  {formData.aboutSection.points.map((pt) => (
                    <div key={pt.id} className="d-flex mb-2">
                      <input
                        className="form-control"
                        value={pt.text[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "aboutSection",
                            "points",
                            pt.id,
                            "text",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                      <button
                        className="btn btn-sm btn-danger ms-2"
                        onClick={() =>
                          removeArrayItem("aboutSection", "points", pt.id)
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary mb-3"
                    onClick={() =>
                      addArrayItem("aboutSection", "points", {
                        text: { en: "", ar: "" },
                      })
                    }
                  >
                    {t("addPoint")}
                  </button>
                  {["projects", "members", "experience", "clients"].map(
                    (stat) => (
                      <div key={stat} className="mb-3 border p-2 rounded">
                        <h6>{t(stat)}</h6>
                        <div className="mb-2">
                          <label>{t("count")}</label>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.aboutSection[stat].count}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                aboutSection: {
                                  ...prev.aboutSection,
                                  [stat]: {
                                    ...prev.aboutSection[stat],
                                    count: Number(e.target.value),
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="mb-2">
                          <label>{t("text")}</label>
                          <input
                            className="form-control"
                            value={
                              formData.aboutSection[stat].text[activeLang] || ""
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                aboutSection: {
                                  ...prev.aboutSection,
                                  [stat]: {
                                    ...prev.aboutSection[stat],
                                    text: {
                                      ...prev.aboutSection[stat].text,
                                      [activeLang]: e.target.value,
                                    },
                                  },
                                },
                              }))
                            }
                            dir={activeLang === "en" ? "ltr" : "rtl"}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {section === "specialServices" && (
                <div>
                  <h6>{t("services")}</h6>
                  {formData.specialServices.services.map((srv, index) => (
                    <div key={srv.id} className="border p-2 mb-2 rounded">
                      <div className="d-flex justify-content-between">
                        <h6 className="fw-bold">
                          {t("service")}. {index + 1}
                        </h6>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            removeArrayItem(
                              "specialServices",
                              "services",
                              srv.id
                            )
                          }
                        >
                          ✕
                        </button>
                      </div>
                      <label>{t("headline")}</label>
                      <input
                        className="form-control mb-1"
                        value={srv.headline[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "specialServices",
                            "services",
                            srv.id,
                            "headline",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                      <label>{t("copy")}</label>
                      <textarea
                        className="form-control mb-1"
                        value={srv.copy[activeLang] || ""}
                        onChange={(e) =>
                          updateArrayItem(
                            "specialServices",
                            "services",
                            srv.id,
                            "copy",
                            e.target.value
                          )
                        }
                        dir={activeLang === "en" ? "ltr" : "rtl"}
                      />
                    </div>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      addArrayItem("specialServices", "services", {
                        headline: { en: "", ar: "" },
                        copy: { en: "", ar: "" },
                      })
                    }
                  >
                    {t("addService")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        {t("saveAll")}
      </button>
    </div>
  );
}
