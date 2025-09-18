"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useContent } from "@/contexts/ContentContext";
import { nanoid } from "nanoid";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";

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

const handleImageDelete = async (path) => {
  const res = await fetch(`/api/image`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket: "bit-content-images", path }),
  });
  if (!res.ok) throw new Error("Failed to delete image");
};

export default function GalleryPage() {
  const locale = useLocale();
  const t = useTranslations("gallery");
  const c = useTranslations("common");
  const { gallery, galleryLoading } = useContent();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    id: null,
    type: "image",
    url: "",
    path: "",
    category: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);

  const docRef = doc(db, "content", "gallery");

  const saveCategories = async () => {
    try {
      await updateDoc(docRef, { categories });
      toast.success(c("saveSuccess"));
    } catch (error) {
      console.log("Failed to save categories");
    }
  };

  const addCategory = () => {
    setCategories([...categories, { id: nanoid(), name: { en: "", ar: "" } }]);
  };

  const updateCategory = (id, lang, value) => {
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, name: { ...c.name, [lang]: value } } : c
      )
    );
  };

  const removeCategory = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const openAddItem = () => {
    setCurrentItem({
      id: null,
      type: "image",
      url: "",
      path: "",
      category: "",
      file: null,
    });
    setShowModal(true);
    setEditingItem(false);
  };

  const openEditItem = (item) => {
    setCurrentItem({ ...item, file: null });
    setShowModal(true);
    setEditingItem(true);
  };

  const saveItem = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      let url = currentItem.url;
      let path = currentItem.path;

      if (currentItem.type === "image" && currentItem.file) {
        if (currentItem.path) await handleImageDelete(currentItem.path);
        const upload = await handleImageUpload(
          currentItem.file,
          `content/gallery/${nanoid()}`
        );
        url = upload.url;
        path = upload.path;
      }

      const newItem = {
        id: currentItem.id || nanoid(),
        type: currentItem.type,
        url,
        path,
        category: currentItem.category,
      };

      let newItems;
      if (currentItem.id) {
        newItems = items.map((i) => (i.id === currentItem.id ? newItem : i));
      } else {
        newItems = [...items, newItem];
      }

      setItems(newItems);
      await updateDoc(docRef, { items: newItems });
      setShowModal(false);
      toast.success(c("saveSuccess"));
    } catch (error) {
      console.log("Faild to save the item", error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (item) => {
    const confirm = window.confirm(t("confirmDelete"));
    if (!confirm) {
      return;
    }
    try {
      setDeletingIds((prev) => [...prev, item.id]);
      if (item.type === "image" && item.path) {
        await handleImageDelete(item.path);
      }
      const newItems = items.filter((i) => i.id !== item.id);
      setItems(newItems);
      await updateDoc(docRef, { items: newItems });
      toast.success(c("deleteSuccess"));
    } catch (error) {
      console.log("Failed to delete the itenm");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  useEffect(() => {
    setItems(gallery.items);
    setCategories(gallery.categories);
  }, [gallery]);

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px",
        borderRadius: "18px",
        border: "1px solid rgba(227, 227, 227, 1)",
      }}
    >
      <h4 className="mb-5">{t("pageTitle")}</h4>

      <div className="mb-5 rounded border">
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ cursor: "pointer", backgroundColor: "#f7f7f7" }}
          onClick={() => setShowCategories(!showCategories)}
        >
          <h5 className="mb-0">{t("categories")}</h5>
          {showCategories ? <FaChevronUp /> : <FaChevronDown />}
        </div>

        {showCategories && (
          <div className="p-3">
            {categories.map((cat) => (
              <div key={cat.id} className="mb-3">
                <div className="d-flex mb-2">
                  <input
                    type="text"
                    className="form-control me-2"
                    value={cat.name.en}
                    onChange={(e) =>
                      updateCategory(cat.id, "en", e.target.value)
                    }
                    placeholder="Category (EN)"
                  />
                  <input
                    type="text"
                    className="form-control me-2"
                    value={cat.name.ar}
                    onChange={(e) =>
                      updateCategory(cat.id, "ar", e.target.value)
                    }
                    placeholder="Category (AR)"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeCategory(cat.id)}
                  >
                    {c("delete")}
                  </button>
                </div>
              </div>
            ))}
            <button
              className={`btn btn-primary btn-sm ${
                locale === "en" ? "me-2" : "ms-2"
              }`}
              onClick={addCategory}
            >
              {t("addCategory")}
            </button>
            <button className="btn btn-success btn-sm" onClick={saveCategories}>
              {c("save")}
            </button>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>{t("galleryItems")}</h5>
        <button className="btn btn-success btn-sm" onClick={openAddItem}>
          {t("addItem")}
        </button>
      </div>
      {galleryLoading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <h6 className="text-center my-5">{t("noItems")}</h6>
      ) : (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("type")}</th>
              <th>{t("preview")}</th>
              <th>{t("cateory")}</th>
              <th>{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.type}</td>
                <td>
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="preview"
                      style={{ width: "80px", borderRadius: "8px" }}
                    />
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0d6efd", textDecoration: "underline" }}
                    >
                      {t("watch")}
                    </a>
                  )}
                </td>
                <td>
                  {categories.find((c) => c.name.en === item.category)?.name[
                    locale
                  ] || item.category}
                </td>
                <td>
                  <button
                    className={`btn btn-warning btn-sm ${
                      locale === "en" ? "me-2" : "ms-2"
                    }`}
                    onClick={() => openEditItem(item)}
                  >
                    {c("edit")}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(item)}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title">
                  {editingItem ? t("editingItem") : t("addingItem")}
                </h5>
                <IoMdClose
                  style={{ cursor: "pointer", width: "24px", height: "24px" }}
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={saveItem} id="itemForm">
                  <div className="mb-3">
                    <label className="form-label">{t("type")}</label>
                    <select
                      name="type"
                      className="form-select"
                      value={currentItem.type}
                      onChange={(e) =>
                        setCurrentItem({ ...currentItem, type: e.target.value })
                      }
                    >
                      <option value="image">{t("image")}</option>
                      <option value="video">{t("video")}</option>
                    </select>
                  </div>

                  {currentItem.type === "image" && (
                    <div className="mb-3">
                      <label className="form-label d-block">{t("image")}</label>
                      <input
                        type="file"
                        name="file"
                        accept="image/*"
                        className="d-none"
                        id="imageInput"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setCurrentItem({ ...currentItem, file, url: "" });
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() =>
                          document.getElementById("imageInput").click()
                        }
                      >
                        {currentItem.url || currentItem.file
                          ? c("change")
                          : c("add")}
                      </button>

                      {(currentItem.url || currentItem.file) && (
                        <div className="mt-3">
                          <img
                            src={
                              currentItem.url ||
                              URL.createObjectURL(currentItem.file)
                            }
                            alt="preview"
                            style={{ width: "120px", borderRadius: "8px" }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {currentItem.type === "video" && (
                    <div className="mb-3">
                      <label className="form-label">{t("videoUrl")}</label>
                      <input
                        type="url"
                        name="url"
                        className="form-control"
                        value={currentItem.url}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            url: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">{t("category")}</label>
                    <select
                      name="category"
                      className="form-select"
                      value={currentItem.category}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          category: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">{t("selectCategory")}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name.en}>
                          {cat.name[locale]}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {c("cancel")}
                </button>
                <button
                  type="submit"
                  form="itemForm"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div
                      className="spinner-border spinner-border-sm text-light"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    c("save")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
