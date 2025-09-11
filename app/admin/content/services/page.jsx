"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useContent } from "@/contexts/ContentContext";
import { nanoid } from "nanoid";
import { IoMdClose } from "react-icons/io";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

export default function Services() {
  const locale = useLocale();
  const t = useTranslations("services");
  const c = useTranslations("common");
  const { serviceContent, serviceLoading } = useContent();
  const [pageContent, setPageContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
    featuresHeadline: { en: "", ar: "" },
    featuresCopy: { en: "", ar: "" },
    benefitsHeadline: { en: "", ar: "" },
    benefitsCopy: { en: "", ar: "" },
    processHeadline: { en: "", ar: "" },
    processCopy: { en: "", ar: "" },
    ctaHeadline: { en: "", ar: "" },
    ctaCopy: { en: "", ar: "" },
    ctaButtonText: { en: "", ar: "" },
  });
  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState({
    id: "",
    headline: { en: "", ar: "" },
    slug: "",
    copy: { en: "", ar: "" },
    image: { url: "", path: "" },
    href: "",
    features: [],
    benefits: [],
    process: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [deletedImages, setDeletedImages] = useState([]);
  const [openSections, setOpenSections] = useState({
    hero: false,
    services: false,
    cta: false,
  });
  const [slugError, setSlugError] = useState("");

  const fileInputRefs = {};

  const handleAddService = () => {
    const newService = {
      id: nanoid(),
      headline: { en: "", ar: "" },
      slug: "",
      copy: { en: "", ar: "" },
      image: { file: null, url: "", path: "" },
      href: "",
      features: [],
      benefits: [],
      process: [],
    };
    setServices((prev) => [...prev, newService]);
  };

  const handleImageButtonClick = (id) => {
    if (fileInputRefs[id]) fileInputRefs[id].click();
  };

  const handleImageChange = (id, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);

    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, image: { ...s.image, file, url: previewUrl } } : s
      )
    );
  };

  const handleDeleteService = (id) => {
    setServices((prev) => {
      const serviceToDelete = prev.find((s) => s.id === id);
      if (serviceToDelete?.image?.path) {
        setDeletedImages((imgs) => [...imgs, serviceToDelete.image.path]);
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const handleAddItem = (serviceId, type) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              [type]: [
                ...s[type],
                { id: nanoid(), headline: { en: "", ar: "" } },
              ],
            }
          : s
      )
    );
  };

  const handleUpdateItem = (serviceId, type, itemId, lang, value) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              [type]: s[type].map((item) =>
                item.id === itemId
                  ? { ...item, headline: { ...item.headline, [lang]: value } }
                  : item
              ),
            }
          : s
      )
    );
  };

  const handleDeleteItem = (serviceId, type, itemId) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              [type]: s[type].filter((item) => item.id !== itemId),
            }
          : s
      )
    );
  };

  const handleSaveToFirestore = async () => {
    try {
      setLoading(true);

      await Promise.all(
        deletedImages.map(async (path) => {
          const resImg = await fetch(`/api/image`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bucket: "bit-content-images",
              path,
            }),
          });
          if (!resImg.ok) throw new Error("Failed to delete image");
        })
      );

      const uploadedServices = await Promise.all(
        services.map(async (s) => {
          if (s.image.file) {
            const formData = new FormData();
            formData.append("file", s.image.file);
            formData.append("path", `content/services/${s.id}`);
            formData.append("bucket", "bit-content-images");

            const res = await fetch("/api/image", {
              method: "POST",
              body: formData,
            });
            if (!res.ok) throw new Error("Image upload failed");
            const data = await res.json();

            return {
              ...s,
              image: { url: data.url, path: `content/services/${s.id}` },
            };
          }
          return s;
        })
      );

      await updateDoc(doc(db, "content", "services"), {
        ...pageContent,
        services: uploadedServices,
      });

      setServices(uploadedServices);
      toast.success(c("saveSuccess"));
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
    setServices(serviceContent.services);
    setPageContent({
      headline: serviceContent.headline,
      copy: serviceContent.copy,
      featuresHeadline: serviceContent.featuresHeadline,
      featuresCopy: serviceContent.featuresCopy,
      benefitsHeadline: serviceContent.benefitsHeadline,
      benefitsCopy: serviceContent.benefitsCopy,
      processHeadline: serviceContent.processHeadline,
      processCopy: serviceContent.processCopy,
      ctaHeadline: serviceContent.ctaHeadline,
      ctaCopy: serviceContent.ctaCopy,
      ctaButtonText: serviceContent.ctaButtonText,
    });
  }, [serviceContent]);

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
            <label className="form-label">{t("headline")}</label>
            <input
              className="form-control mb-2"
              value={pageContent.headline[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  headline: { ...prev.headline, [activeLang]: e.target.value },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="form-label">{t("copy")}</label>
            <textarea
              className="form-control"
              rows={3}
              value={pageContent.copy[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  copy: { ...prev.copy, [activeLang]: e.target.value },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
          </div>
        )}
      </div>

      <div className="mb-4 border rounded">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("services")}
        >
          <h5 className="mb-0">{t("services")}</h5>
          {openSections.services ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.services && (
          <div className="p-3">
            <label className="form-label">{t("featuresHeadline")}</label>
            <input
              className="form-control mb-2"
              value={pageContent.featuresHeadline[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  featuresHeadline: {
                    ...prev.featuresHeadline,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="form-label">{t("featuresCopy")}</label>
            <textarea
              className="form-control mb-2"
              rows={3}
              value={pageContent.featuresCopy[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  featuresCopy: {
                    ...prev.featuresCopy,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="form-label">{t("benefitsHeadline")}</label>
            <input
              className="form-control mb-2"
              value={pageContent.benefitsHeadline[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  benefitsHeadline: {
                    ...prev.benefitsHeadline,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="form-label">{t("benefitsCopy")}</label>
            <textarea
              className="form-control mb-2"
              rows={3}
              value={pageContent.benefitsCopy[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  benefitsCopy: {
                    ...prev.benefitsCopy,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="form-label">{t("processHeadline")}</label>
            <input
              className="form-control mb-2"
              value={pageContent.processHeadline[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  processHeadline: {
                    ...prev.processHeadline,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            <label className="form-label">{t("processCopy")}</label>
            <textarea
              className="form-control mb-2"
              rows={3}
              value={pageContent.processCopy[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  processCopy: {
                    ...prev.processCopy,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
            {serviceLoading ? (
              <div className="d-flex justify-content-center align-items-center my-5">
                <div className="spinner-border primary-color" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : services.length === 0 ? (
              <h5 className="text-center my-5">{t("noServices")}</h5>
            ) : (
              <>
                {services.map((service, index) => (
                  <div key={service.id} className="card p-3 mb-3">
                    <div className="d-flex justify-content-between mb-3">
                      <h6>
                        {t("service")} {index + 1}
                      </h6>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        {c("delete")}
                      </button>
                    </div>
                    <input
                      className="form-control mb-2"
                      placeholder={t("headline")}
                      value={service.headline[activeLang]}
                      onChange={(e) =>
                        setServices((prev) =>
                          prev.map((s) =>
                            s.id === service.id
                              ? {
                                  ...s,
                                  headline: {
                                    ...s.headline,
                                    [activeLang]: e.target.value,
                                  },
                                }
                              : s
                          )
                        )
                      }
                      dir={activeLang === "ar" ? "rtl" : "ltr"}
                    />
                    <input
                      className="form-control mb-2"
                      placeholder={c("slug")}
                      value={service.slug}
                      onChange={(e) => {
                        const { value } = e.target;
                        if (value.includes("-")) {
                          setSlugError(c("noHyphens"));
                          return;
                        } else {
                          setSlugError("");
                        }
                        setServices((prev) =>
                          prev.map((s) =>
                            s.id === service.id
                              ? {
                                  ...s,
                                  slug: value,
                                }
                              : s
                          )
                        );
                      }}
                      dir={activeLang === "ar" ? "rtl" : "ltr"}
                    />
                    {slugError !== "" && (
                      <div className="form-text text-danger mb-2">
                        {slugError}
                      </div>
                    )}
                    <textarea
                      className="form-control mb-2"
                      placeholder={t("copy")}
                      value={service.copy[activeLang]}
                      onChange={(e) =>
                        setServices((prev) =>
                          prev.map((s) =>
                            s.id === service.id
                              ? {
                                  ...s,
                                  copy: {
                                    ...s.copy,
                                    [activeLang]: e.target.value,
                                  },
                                }
                              : s
                          )
                        )
                      }
                      rows={5}
                      dir={activeLang === "ar" ? "rtl" : "ltr"}
                    />
                    {service.image.url && (
                      <img
                        src={service.image.url}
                        alt="preview"
                        style={{ width: "100px", height: "auto" }}
                        className="mb-2"
                      />
                    )}
                    <div className="mb-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleImageButtonClick(service.id)}
                      >
                        {service.image?.url ? t("changeImage") : t("addImage")}
                      </button>
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs[service.id] = el)}
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleImageChange(service.id, e.target.files[0])
                        }
                      />
                    </div>
                    {["features", "benefits", "process"].map((type) => (
                      <div key={type} className="mt-3">
                        <h6 className="d-flex justify-content-between align-items-center">
                          {t(type)}
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAddItem(service.id, type)}
                          >
                            + {c("add")}
                          </button>
                        </h6>
                        {service[type].map((item) => (
                          <div
                            key={item.id}
                            className="d-flex align-items-center gap-2 mb-2"
                          >
                            <input
                              className="form-control"
                              placeholder={`${t("headline")} (${activeLang})`}
                              value={item.headline[activeLang]}
                              onChange={(e) =>
                                handleUpdateItem(
                                  service.id,
                                  type,
                                  item.id,
                                  activeLang,
                                  e.target.value
                                )
                              }
                              dir={activeLang === "ar" ? "rtl" : "ltr"}
                            />
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDeleteItem(service.id, type, item.id)
                              }
                            >
                              <IoMdClose />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
            <button
              className="btn btn-outline-primary mb-4 d-block mb-5"
              onClick={handleAddService}
            >
              + {t("add")}
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 rounded border">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => toggleSection("cta")}
        >
          <h5 className="mb-0">{t("ctaSection")}</h5>
          {openSections.cta ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.cta && (
          <div className="p-3">
            <label className="form-label">{t("ctaHeadline")}</label>
            <input
              className="form-control mb-2"
              value={pageContent.ctaHeadline[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  ctaHeadline: {
                    ...prev.ctaHeadline,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />

            <label className="form-label">{t("ctaCopy")}</label>
            <textarea
              className="form-control mb-2"
              rows={3}
              value={pageContent.ctaCopy[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  ctaCopy: {
                    ...prev.ctaCopy,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />

            <label className="form-label">{t("ctaButtonText")}</label>
            <input
              className="form-control"
              value={pageContent.ctaButtonText[activeLang]}
              onChange={(e) =>
                setPageContent((prev) => ({
                  ...prev,
                  ctaButtonText: {
                    ...prev.ctaButtonText,
                    [activeLang]: e.target.value,
                  },
                }))
              }
              dir={activeLang === "ar" ? "rtl" : "ltr"}
            />
          </div>
        )}
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
