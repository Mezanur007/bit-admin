"use client";
import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { nanoid } from "nanoid";
import { IoMdClose } from "react-icons/io";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";

export default function Faq() {
  const locale = useLocale();
  const t = useTranslations("faq");
  const c = useTranslations("common");
  const { faq, faqLoading: loading } = useContent();
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    id: null,
  });
  const [saving, setSaving] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);

  const faqDocRef = doc(db, "content", "faq");

  const handleShowModal = (faqItem = null) => {
    if (faqItem) {
      setEditingFaq(faqItem);
      setFormData({
        question: faqItem.question,
        answer: faqItem.answer,
        id: faqItem.id,
      });
    } else {
      setEditingFaq(null);
      setFormData({ question: "", answer: "", id: null });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const id = editingFaq ? editingFaq.id : nanoid();
      const newFaq = { ...formData, id };

      const updatedFaq = editingFaq
        ? faq.map((f) => (f.id === id ? newFaq : f))
        : [...faq, newFaq];

      await updateDoc(faqDocRef, { faq: updatedFaq });
      setShowModal(false);
      toast.success(c("saveSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faqItem) => {
    const confirmed = window.confirm(t("confirmDelete"));
    if (!confirmed) return;

    setDeletingIds((prev) => [...prev, faqItem.id]);
    try {
      const updatedFaq = faq.filter((f) => f.id !== faqItem.id);
      await updateDoc(faqDocRef, { faq: updatedFaq });
      toast.success("c(deleteSuccess)");
    } catch (err) {
      console.error(err);
      toast.error(t("error"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== faqItem.id));
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
      <div className="d-flex justify-content-between align-items-start mb-5">
        <h4>{t("pageTitle")}</h4>
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
      ) : faq.length === 0 ? (
        <h5 className="text-center my-5">{t("noFaq")}</h5>
      ) : (
        <div className="d-flex flex-column gap-3">
          {faq.map((item, index) => (
            <div
              key={item.id}
              className="card p-3 shadow-sm"
              style={{ borderRadius: "12px", border: "1px solid #dee2e6" }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="fw-bold">
                    {index + 1}. {item.question}
                  </h6>
                  <p>{item.answer}</p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleShowModal(item)}
                  >
                    {c("edit")}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item)}
                    disabled={deletingIds.includes(item.id)}
                  >
                    {deletingIds.includes(item.id) ? (
                      <div
                        className="spinner-border spinner-border-sm text-light"
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
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title">
                  {editingFaq ? t("editFaq") : t("add")}
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
                    <label className="form-label">{t("question")}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.question}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, question: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("answer")}</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.answer}
                      required
                      onChange={(e) =>
                        setFormData({ ...formData, answer: e.target.value })
                      }
                    ></textarea>
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
                      disabled={saving}
                    >
                      {saving ? (
                        <div
                          className="spinner-border spinner-border-sm text-light"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : editingFaq ? (
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
