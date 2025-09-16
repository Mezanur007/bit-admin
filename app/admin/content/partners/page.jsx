"use client";
import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useContent } from "@/contexts/ContentContext";
import { nanoid } from "nanoid";
import { IoMdClose } from "react-icons/io";

export default function TrustedPartners() {
  const locale = useLocale();
  const t = useTranslations("partnersPage");
  const c = useTranslations("common");
  const { partnersContent, partnersLoading: loading } = useContent();
  const [headline, setHeadline] = useState({ en: "", ar: "" });
  const [copy, setCopy] = useState({ en: "", ar: "" });
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({ name: "", logo: "" });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const [activeLang, setActiveLang] = useState(locale || "en");

  const handleShowModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({ name: partner.name, logo: partner.logo });
    } else {
      setEditingPartner(null);
      setFormData({ name: "", logo: "" });
      setFile(null);
    }
    setShowModal(true);
  };

  const handleSaveToFirestore = async () => {
    try {
      await updateDoc(doc(db, "content", "partners"), {
        headline,
        copy,
      });
      toast.success(c("saveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  const handleSave = async () => {
    if (!file && !editingPartner) {
      toast.error(t("logoRequired"));
      return;
    }
    try {
      setUploading(true);
      let partnerId = editingPartner ? editingPartner.id : nanoid();
      let logoURL = editingPartner?.logo || "";

      const path = `content/partners/${partnerId}`;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", path);
        formData.append("bucket", "bit-content-images");

        const res = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        logoURL = data.url;
      }

      const newPartner = {
        id: partnerId,
        name: formData.name,
        logo: logoURL,
        path,
      };

      const updatedPartners = editingPartner
        ? partners.map((p) => (p.id === partnerId ? newPartner : p))
        : [...partners, newPartner];

      const partnersDocRef = doc(db, "content", "partners");
      await updateDoc(partnersDocRef, { partners: updatedPartners });

      toast.success(editingPartner ? t("updated") : t("added"));

      setShowModal(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      toast.error(t("error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (partner) => {
    const confirmed = window.confirm(t("confirmDelete"));
    if (!confirmed) return;
    setDeletingIds((prev) => [...prev, partner.id]);
    try {
      const resImg = await fetch(`/api/image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucket: "bit-content-images",
          path: partner.path,
        }),
      });

      if (!resImg.ok) throw new Error("Failed to delete image");
      const updatedPartners = partners.filter((p) => p.id !== partner.id);

      const partnersDocRef = doc(db, "content", "partners");
      await updateDoc(partnersDocRef, { partners: updatedPartners });
      toast.success(t("deleted"));
    } catch (err) {
      console.error(err);
      toast.error(t("error"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== partner.id));
    }
  };

  useEffect(() => {
    setHeadline(partnersContent.headline);
    setCopy(partnersContent.copy);
  }, [partnersContent]);

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

      <div className="mb-3">
        <label className="form-label">{t("headline")}</label>
        <input
          className="form-control"
          value={headline[activeLang]}
          onChange={(e) =>
            setHeadline((prev) => ({ ...prev, [activeLang]: e.target.value }))
          }
          dir={activeLang === "ar" ? "rtl" : "ltr"}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">{t("copy")}</label>
        <textarea
          className="form-control"
          rows={3}
          value={copy[activeLang]}
          onChange={(e) =>
            setCopy((prev) => ({ ...prev, [activeLang]: e.target.value }))
          }
          dir={activeLang === "ar" ? "rtl" : "ltr"}
        />
      </div>
      <button
        className="btn btn-success mb-5"
        onClick={handleSaveToFirestore}
        disabled={loading}
      >
        {loading ? c("saving") : c("save")}
      </button>

      <div className="d-flex justify-content-between align-items-start mb-5">
        <h4>{t("partners")}</h4>
        <div
          className="primaryButton"
          style={{ borderRadius: "12px" }}
          onClick={() => handleShowModal()}
        >
          {t("add")}
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : partnersContent.partners.length === 0 ? (
        <h5 className="text-center my-5">{t("noPartners")}</h5>
      ) : (
        <div
          className="d-flex flex-wrap justify-content-start gap-3"
          style={{ marginTop: "16px" }}
        >
          {partnersContent.partners.map((partner) => (
            <div key={partner.id} style={{ flex: "0 1 220px" }}>
              <div
                className="card h-100 text-center shadow-sm"
                style={{
                  border: "1px solid #dee2e6",
                  borderRadius: "12px",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0,0,0,0.05)";
                }}
              >
                <div className="card-body d-flex flex-column align-items-center">
                  <img
                    src={partner.logo}
                    alt="no logo"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "contain",
                      marginBottom: "10px",
                      borderRadius: "8px",
                    }}
                  />
                  <h6 className="card-title mb-3">{partner.name}</h6>
                  <div className="mt-auto d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleShowModal(partner)}
                    >
                      {c("edit")}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(partner)}
                      disabled={deletingIds.includes(partner.id)}
                    >
                      {deletingIds.includes(partner.id) ? (
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        c("delete")
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title">
                  {editingPartner ? t("editPartner") : t("add")}
                </h5>
                <IoMdClose
                  style={{ cursor: "pointer", width: "24px", height: "24px" }}
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  <div className="mb-3">
                    <label className="form-label">{t("name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("logo")}</label>
                    <div className="d-flex flex-column align-items-start gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() =>
                          document.getElementById("logoInput").click()
                        }
                      >
                        {editingPartner || file ? c("change") : c("add")}
                      </button>

                      {file && (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          style={{
                            width: "150px",
                          }}
                        />
                      )}

                      <input
                        type="file"
                        id="logoInput"
                        className="d-none"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                      />

                      {editingPartner && !file && (
                        <img
                          src={formData.logo}
                          alt="Current logo"
                          style={{
                            width: "150px",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="d-flex">
                    <button
                      type="button"
                      className={`greyButton border-0 ${
                        locale === "en" ? "me-2" : "ms-2"
                      }`}
                      onClick={() => setShowModal(false)}
                    >
                      {c("cancel")}
                    </button>
                    <button
                      type="submit"
                      className="primaryButton border-0 rounded"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <div
                          className="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : editingPartner ? (
                        c("update")
                      ) : (
                        c("add")
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
