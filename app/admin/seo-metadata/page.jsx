"use client";
import { PlusOne, Save, Search } from "@mui/icons-material";
import React, { useState, useEffect } from "react";
import {
  FiAlertCircle,
  FiEdit2,
  FiLoader,
  FiTrash2,
} from "react-icons/fi";
import { LuLoader } from "react-icons/lu";
import { useTranslations, useLocale } from "next-intl";

export default function SEOMetadataAdmin() {
  const locale = useLocale();
  const t = useTranslations("metadata");
  const c = useTranslations("common");
  const isRTL = locale === "ar";

  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] =
    useState(true);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [formData, setFormData] = useState({
    id: "",
    en: { title: "", description: "", keywords: "" },
    ar: { title: "", description: "", keywords: "" },
    image: "",
    lastModified: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchPages = async () => {
    setInitialLoading(true);
    try {
      const response = await fetch("/api/seo-metadata");
      const result = await response.json();

      if (result.success) {
        setPages(result.data);
      } else {
        setMessage({
          type: "error",
          text: "Failed to load pages",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error fetching pages",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const method = selectedPage ? "PUT" : "POST";
      const response = await fetch("/api/seo-metadata", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message,
        });
        setIsEditing(false);
        setSelectedPage(null);
        await fetchPages();
        resetForm();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to save metadata. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (page) => {
    setFormData(page);
    setSelectedPage(page);
    setIsEditing(true);
  };

  const handleDelete = async (pageId) => {
    if (
      !confirm(
        "Are you sure you want to delete this page metadata?"
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/seo-metadata?id=${pageId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        setPages(pages.filter((p) => p.id !== pageId));
        setMessage({
          type: "success",
          text: result.message,
        });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to delete page",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      en: { title: "", description: "", keywords: "" },
      ar: { title: "", description: "", keywords: "" },
      image: "",
      lastModified: "",
    });
  };

  const filteredPages = pages.filter(
    (page) =>
      page.id
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      page.en.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (initialLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <FiLoader
            className="mb-3"
            size={48}
            style={{ animation: "spin 1s linear infinite" }}
          />
          <p className="text-muted">
            Loading SEO metadata...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 bg-light py-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .page-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid #e9ecef;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          position: relative;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }
        .page-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #0d6efd, #0dcaf0);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        [dir="rtl"] .page-card::before {
          left: auto;
          right: 0;
        }
        .page-card:hover::before {
          transform: scaleX(1);
        }
        .page-card:hover {
          border-color: #0d6efd;
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(13, 110, 253, 0.15);
          background: linear-gradient(135deg, #ffffff 0%, #e7f1ff 100%);
        }
        .page-card.active {
          border-color: #0d6efd;
          background: linear-gradient(135deg, #e7f1ff 0%, #cfe2ff 100%);
          box-shadow: 0 8px 16px rgba(13, 110, 253, 0.2);
        }
        .page-card.active::before {
          transform: scaleX(1);
        }
        .page-id-badge {
          display: inline-block;
          padding: 4px 8px;
          background: linear-gradient(135deg, #0d6efd, #0dcaf0);
          color: white;
          border-radius: 20px;
          font-size: 0.65rem;
          margin-left:-6px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
          white-space: nowrap;
        }
        .page-title-text {
          font-size: 0.875rem;
          color: #495057;
          font-weight: 500;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .action-btn {
          transition: all 0.2s ease;
          border-radius: 8px !important;
        }
        .action-btn:hover {
          transform: scale(1.1);
        }
        .character-count {
          font-size: 0.75rem;
          color: #6c757d;
          margin-top: 0.25rem;
        }
          .card-body > .d-flex {
          gap: 10px;
          }

      `}</style>

      <div
        className="container"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            {/* <div className="d-flex justify-content-between align-items-center"> */}
            <div className="d-flex flex-wrap justify-content-between align-items-center">
              <div>
                <h1 className="card-title h3 mb-2">
                  {t("pageTitle")}
                </h1>
                <p className="text-muted mb-0">
                  {t("description")}
                </p>
              </div>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => {
                  resetForm();
                  setIsEditing(true);
                  setSelectedPage(null);
                }}
              >
                <PlusOne size={20} />
                {t("addNew")}
              </button>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`alert ${
              message.type === "success"
                ? "alert-success"
                : "alert-danger"
            } alert-dismissible fade show d-flex align-items-center`}
            role="alert"
          >
            <FiAlertCircle
              size={20}
              className={isRTL ? "ms-2" : "me-2"}
            />
            <span>{message.text}</span>
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setMessage({ type: "", text: "" })
              }
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Pages Grid Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">
                {t("allPages")} ({pages.length})
              </h2>

              {/* Search */}
              <div
                className="input-group shadow-sm"
                style={{
                  maxWidth: "320px",
                  borderRadius: "25px",
                  overflow: "hidden",
                }}
              >
                <span className="input-group-text bg-white border-0 px-3">
                  <Search
                    size={18}
                    className="text-secondary"
                  />
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  style={{ boxShadow: "none" }}
                />
              </div>
            </div>

            {/* Pages Grid */}
            {filteredPages.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted h5 mb-3">
                  {t("noPages")}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    resetForm();
                    setIsEditing(true);
                    setSelectedPage(null);
                  }}
                >
                  <PlusOne
                    size={18}
                    className={isRTL ? "ms-2" : "me-2"}
                  />
                  {t("addFirst")}
                </button>
              </div>
            ) : (
              <div className="row g-2">
                {filteredPages.map((page) => (
                  <div
                    key={page.id}
                    className="col-md-6 col-lg-4"
                  >
                    <div
                      className={`card page-card h-100 ${
                        selectedPage?.id === page.id
                          ? "active"
                          : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleEdit(page)}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="page-id-badge">
                            {page.id}
                          </span>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(page);
                              }}
                              title="Edit"
                            >
                              <FiEdit2 size={12} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(page.id);
                              }}
                              title="Delete"
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span
                              style={{ fontSize: "1.1rem" }}
                            >
                              🇬🇧
                            </span>
                            <p
                              className="page-title-text mb-0"
                              dir="ltr"
                            >
                              {page.en.title}
                            </p>
                          </div>
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              style={{ fontSize: "1.1rem" }}
                            >
                              🇸🇦
                            </span>
                            <p
                              className="page-title-text mb-0"
                              dir="rtl"
                            >
                              {page.ar.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit/Create Form Section */}
        {isEditing && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h4 mb-4">
                {selectedPage
                  ? t("editPage")
                  : t("addNewPage")}
              </h2>

              {/* Page ID */}
              <div className="mb-4">
                <label className="form-label fw-medium">
                  {t("pageId")}{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id: e.target.value,
                    })
                  }
                  disabled={Boolean(selectedPage)}
                  // disabled={!!selectedPage}
                  placeholder={t("pageIdPlaceholder")}
                  style={{
                    cursor: selectedPage
                      ? "not-allowed"
                      : "text",
                  }}
                />
                <small className="form-text text-muted">
                  {t("pageIdHelp")}
                </small>
              </div>

              {/* English Section */}
              <div className="card bg-primary bg-opacity-10 border-0 mb-4">
                <div className="card-body">
                  <h3 className="h5 mb-3">
                    🇬🇧 {t("english")}
                  </h3>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      {t("title")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      dir="ltr"
                      style={{ textAlign: "left" }}
                      value={formData.en.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          en: {
                            ...formData.en,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder={t("titlePlaceholder")}
                    />
                    <div className="character-count">
                      {formData.en.title.length} / 60{" "}
                      {t("charactersRecommended")}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      {t("descriptionAr")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      dir="ltr"
                      style={{ textAlign: "left" }}
                      value={formData.en.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          en: {
                            ...formData.en,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder={t(
                        "descriptionPlaceholder"
                      )}
                    />
                    <div className="character-count">
                      {formData.en.description.length} / 160{" "}
                      {t("charactersRecommended")}
                    </div>
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-medium">
                      {t("keywords")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      dir="ltr"
                      style={{ textAlign: "left" }}
                      value={formData.en.keywords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          en: {
                            ...formData.en,
                            keywords: e.target.value,
                          },
                        })
                      }
                      placeholder={t("keywordsPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Arabic Section */}
              <div className="card bg-success bg-opacity-10 border-0 mb-4">
                <div className="card-body">
                  <h3 className="h5 mb-3">
                    🇸🇦 {t("arabic")}
                  </h3>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      {t("titleAr")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      dir="rtl"
                      style={{ textAlign: "right" }}
                      value={formData.ar.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ar: {
                            ...formData.ar,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder={t("titlePlaceholderAr")}
                    />
                    <div className="character-count">
                      {formData.ar.title.length} / 60{" "}
                      {t("charactersRecommendedAr")}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      {t("descriptionAr")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      dir="lrt"
                      style={{ textAlign: "right" }}
                      value={formData.ar.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ar: {
                            ...formData.ar,
                            description: e.target.value,
                          },
                        })
                      }
                      placeholder={t(
                        "descriptionPlaceholderAr"
                      )}
                    />
                    <div className="character-count">
                      {formData.ar.description.length} / 160{" "}
                      {t("charactersRecommendedAr")}
                    </div>
                  </div>

                  <div className="mb-0">
                    <label className="form-label fw-medium">
                      {t("keywordsAr")}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      dir="rtl"
                      style={{ textAlign: "right" }}
                      value={formData.ar.keywords}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ar: {
                            ...formData.ar,
                            keywords: e.target.value,
                          },
                        })
                      }
                      placeholder={t(
                        "keywordsPlaceholderAr"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary d-flex align-items-center gap-2"
                  onClick={handleSave}
                  disabled={
                    loading ||
                    !formData.id ||
                    !formData.en.title ||
                    !formData.ar.title
                  }
                >
                  {loading ? (
                    <>
                      <LuLoader
                        size={18}
                        style={{
                          animation:
                            "spin 1s linear infinite",
                        }}
                      />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {t("saveChanges")}
                    </>
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedPage(null);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  {c("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
