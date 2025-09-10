"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useTranslations, useLocale } from "next-intl";
import { useContent } from "@/contexts/ContentContext";
import { nanoid } from "nanoid";
import { IoMdClose } from "react-icons/io";

export default function Technologies() {
  const locale = useLocale();
  const t = useTranslations("technologies");
  const c = useTranslations("common");
  const { techContent, techLoading } = useContent();
  const [headline, setHeadline] = useState({ en: "", ar: "" });
  const [copy, setCopy] = useState({ en: "", ar: "" });
  const [techs, setTechs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTech, setCurrentTech] = useState({
    id: "",
    title: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeLang, setActiveLang] = useState(locale || "en");

  const handleShowModal = (tech = null) => {
    if (tech) {
      setCurrentTech(tech);
      setIsEditing(true);
    } else {
      setCurrentTech({ id: "", title: "" });
      setIsEditing(false);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleSaveTech = (e) => {
    e.preventDefault();
    if (isEditing) {
      setTechs((prev) =>
        prev.map((t) => (t.id === currentTech.id ? currentTech : t))
      );
    } else {
      setTechs((prev) => [...prev, { ...currentTech, id: nanoid() }]);
    }

    setModalOpen(false);
  };

  const handleDelete = (id) => {
    setTechs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveToFirestore = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "content", "technologies"), {
        headline,
        copy,
        techs,
      });
      toast.success("Technologies updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHeadline(techContent.headline);
    setCopy(techContent.copy);
    setTechs(techContent.techs);
  }, [techContent]);

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
      <div className="mb-5">
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
      <div className="d-flex justify-content-between align-items-start mb-3">
        <h5>{t("technologies")}</h5>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => handleShowModal()}
        >
          {t("add")}
        </button>
      </div>
      {techLoading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : techs.length === 0 ? (
        <h5 className="text-center my-5">{t("noTechnologies")}</h5>
      ) : (
        <>
          <ul className="list-group mb-4">
            {techs.map((tech) => (
              <li
                key={tech.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {tech.title}
                <div>
                  <button
                    className={`btn btn-sm btn-outline-primary ${
                      locale === "ar" ? "ms-2" : "me-2"
                    }`}
                    onClick={() => handleShowModal(tech)}
                  >
                    {c("edit")}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(tech.id)}
                  >
                    {c("delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-success"
            onClick={handleSaveToFirestore}
            disabled={loading}
          >
            {loading ? c("saving") : c("save")}
          </button>
        </>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title">
                  {isEditing ? c("edit") : c("add")} {t("technology")}
                </h5>
                <IoMdClose
                  style={{ cursor: "pointer", width: "24px", height: "24px" }}
                  onClick={handleCloseModal}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveTech}>
                  <div className="mb-3">
                    <label className="form-label">{t("title")}</label>
                    <input
                      className="form-control"
                      value={currentTech.title}
                      onChange={(e) =>
                        setCurrentTech((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="d-flex">
                    <button
                      type="button"
                      className={`btn btn-secondary ${
                        locale === "ar" ? "ms-2" : "me-2"
                      }`}
                      onClick={handleCloseModal}
                    >
                      {c("cancel")}
                    </button>
                    <button className="btn btn-primary" type="submit">
                      {c("save")}
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
