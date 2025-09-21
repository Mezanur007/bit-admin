"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { IoMdClose } from "react-icons/io";
import { useContent } from "@/contexts/ContentContext";
import { useParams, useRouter } from "next/navigation";

import Loading from "@/components/Loading";

export default function EditEvent() {
  const params = useParams();
  const { eventId } = params;
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("addEvent");
  const p = useTranslations("editEvent");
  const c = useTranslations("common");
  const { events } = useContent();

  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [galleryType, setGalleryType] = useState("photo");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [event, setEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [deletedPhotos, setDeletedPhotos] = useState([]);

  const bannerInputRef = useRef();
  const galleryInputRef = useRef();

  useEffect(() => {
    if (events && eventId) {
      const foundEvent = events.find((e) => e.id === eventId);
      if (foundEvent) {
        setEvent({
          title: foundEvent.title || { en: "", ar: "" },
          slug: foundEvent.slug || "",
          description: foundEvent.description || { en: "", ar: "" },
          banner: foundEvent.banner || null,
          gallery: foundEvent.gallery || [],
        });
      }
    }
  }, [events, eventId]);

  if (!event) {
    return <Loading />;
  }

  const selectBanner = (e) => {
    setEvent((prev) => ({ ...prev, banner: e.target.files[0] }));
  };

  const selectGalleryImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEvent((prev) => ({
      ...prev,
      gallery: [...prev.gallery, { type: "image", file, id: nanoid() }],
    }));
    e.target.value = "";
    setShowModal(false);
  };

  const addGalleryVideo = () => {
    if (!videoUrl) return;
    setEvent((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        { type: "video", url: videoUrl, id: nanoid() },
      ],
    }));
    setVideoUrl("");
    setShowModal(false);
  };

  const convertYoutubeUrl = (url) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split(/[?&]/)[0];
    } else if (url.includes("youtube.com/watch")) {
      const params = new URLSearchParams(url.split("?")[1]);
      videoId = params.get("v");
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const removeGalleryItem = (item) => {
    setEvent((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((i) => i.id !== item.id),
    }));
    if (item.path) {
      setDeletedPhotos([...deletedPhotos, item.path]);
    }
  };

  const dataChange = (field, value) => {
    if (field === "slug") {
      setEvent((prev) => ({ ...prev, slug: value }));
    } else {
      setEvent((prev) => ({
        ...prev,
        [field]: { ...prev[field], [activeLang]: value },
      }));
    }
  };

  const handleImageUpload = async (file, path) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    formData.append("bucket", "bit-content-images");

    const res = await fetch("/api/image", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return { url: data.url, path };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event.banner) {
      toast.error(t("addBanner"));
      return;
    }
    try {
      setLoading(true);

      if (deletedPhotos.length > 0) {
        for (const path of deletedPhotos) {
          await fetch(`/api/image`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              bucket: "bit-content-images",
              path: path,
            }),
          });
        }
      }

      let bannerData = event.banner;
      if (event.banner instanceof File) {
        bannerData = await handleImageUpload(
          event.banner,
          `content/events/event-${eventId}/banner`
        );
      }

      const galleryData = [];
      for (const item of event.gallery) {
        if (item.type === "image" && item.file instanceof File) {
          const uploaded = await handleImageUpload(
            item.file,
            `content/events/event-${eventId}/${item.id}`
          );
          galleryData.push({ type: "image", ...uploaded, id: item.id });
        } else {
          galleryData.push(item);
        }
      }

      const docRef = doc(db, "events", eventId);

      await updateDoc(docRef, {
        title: event.title,
        slug: event.slug,
        description: event.description,
        banner: bannerData,
        gallery: galleryData,
      });

      toast.success(c("saveSuccess"));
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-4 border">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{p("pageTitle")}</h4>
        <select
          className="form-select w-auto"
          value={activeLang}
          onChange={(e) => setActiveLang(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label mb-0">{t("title")}</label>
          <input
            type="text"
            className="form-control mb-3"
            value={event.title[activeLang]}
            onChange={(e) => dataChange("title", e.target.value)}
            required
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
        </div>

        <div className="mb-3">
          <label className="form-label mb-0">{t("slug")}</label>
          <input
            type="text"
            className="form-control mb-3"
            value={event.slug}
            onChange={(e) => dataChange("slug", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label mb-0">{t("description")}</label>
          <textarea
            className="form-control mb-4"
            value={event.description[activeLang]}
            onChange={(e) => dataChange("description", e.target.value)}
            rows={4}
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
        </div>

        <div className="mb-3 d-flex align-items-center justify-content-between">
          <label className="form-label mb-0">{t("banner")}</label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => bannerInputRef.current.click()}
          >
            {t("selectBanner")}
          </button>
          <input
            type="file"
            accept="image/*"
            className="d-none"
            ref={bannerInputRef}
            onChange={selectBanner}
          />
        </div>
        {event.banner &&
          (event.banner instanceof File ? (
            <img
              src={URL.createObjectURL(event.banner)}
              alt="banner"
              style={{ width: "400px", borderRadius: "12px" }}
              className="mb-4"
            />
          ) : (
            <img
              src={event.banner.url}
              alt="banner"
              style={{ width: "400px", borderRadius: "12px" }}
              className="mb-4"
            />
          ))}

        <div className="mb-3 d-flex align-items-center justify-content-between">
          <label className="form-label mb-0">{t("gallery")}</label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowModal(true)}
          >
            {t("addItem")}
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-5">
          {event.gallery.map((item) => (
            <div key={item.id} style={{ position: "relative" }}>
              {item.type === "image" ? (
                item.file ? (
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt="gallery"
                    width={300}
                    height={300}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt="gallery"
                    width={300}
                    height={300}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                )
              ) : (
                <iframe
                  width={300}
                  height={300}
                  src={convertYoutubeUrl(item.url)}
                  style={{ borderRadius: "8px" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              <button
                type="button"
                onClick={() => removeGalleryItem(item)}
                style={{ position: "absolute", top: 0, right: 0 }}
                className="btn btn-sm btn-danger"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
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
      </form>

      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content p-3">
              <div className="modal-header d-flex justify-content-between mb-2">
                <h5 className="modal-title">{t("addItem")}</h5>
                <IoMdClose
                  style={{ cursor: "pointer", width: "24px", height: "24px" }}
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <label className="form-label">{t("type")}</label>
                <select
                  className="form-select mb-3"
                  value={galleryType}
                  onChange={(e) => setGalleryType(e.target.value)}
                >
                  <option value="photo">{t("photo")}</option>
                  <option value="video">{t("video")}</option>
                </select>
                {galleryType === "photo" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100 mb-2"
                      onClick={() => galleryInputRef.current.click()}
                    >
                      {t("selectPhoto")}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      ref={galleryInputRef}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setSelectedPhoto(file);
                        e.target.value = "";
                      }}
                    />
                    {selectedPhoto && (
                      <div className="mt-2 text-center">
                        <img
                          src={URL.createObjectURL(selectedPhoto)}
                          alt="preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "200px",
                            borderRadius: "8px",
                          }}
                        />
                        <div>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger mt-2"
                            onClick={() => setSelectedPhoto(null)}
                          >
                            {t("remove")}
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary w-100 mt-2"
                      disabled={!selectedPhoto}
                      onClick={() => {
                        selectGalleryImage({
                          target: { files: [selectedPhoto] },
                        });
                        setSelectedPhoto(null);
                      }}
                    >
                      {t("addPhoto")}
                    </button>
                  </>
                )}
                {galleryType === "video" && (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Video URL"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={addGalleryVideo}
                      >
                        {t("addVideo")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
