"use client";
import React, { useState, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import { IoMdClose } from "react-icons/io";
import dynamic from "next/dynamic";
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function AddCaseStudy() {
  const locale = useLocale();
  const t = useTranslations("addStudy");
  const c = useTranslations("common");
  const [activeLang, setActiveLang] = useState(locale || "en");
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [study, setStudy] = useState({
    title: { en: "", ar: "" },
    service: { en: "", ar: "" },
    tags: [],
    banner: null,
    slug: "",
    description: { en: "", ar: "" },
    applications: [],
    features: [],
    snaps: [],
    videos: [],
  });
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [inputValue, setInputValue] = useState("");

  const bannerInputRef = React.useRef();

  const editor = useRef(null);

  const config = useMemo(
    () => ({
      height: 500,
      readonly: false,
      direction: activeLang === "ar" ? "rtl" : "ltr",
      placeholder: activeLang === "ar" ? "ابدأ بالكتابة..." : "Start typing...",
    }),
    [activeLang]
  );

  const selectBanner = (e) => {
    setStudy((prev) => ({ ...prev, banner: e.target.files[0] }));

    setTimeout(() => {
      e.target.value = "";
    }, 2000);
  };

  const selectImages = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setStudy((prev) => ({
      ...prev,
      snaps: [
        ...prev.snaps,
        ...files.map((file) => ({
          file,
          id: nanoid(),
        })),
      ],
    }));

    e.target.value = "";
    setShowModal(false);
  };

  const addVideo = () => {
    if (!videoUrl) return;
    setStudy((prev) => ({
      ...prev,
      videos: [...prev.videos, { url: videoUrl, id: nanoid() }],
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

  const removeSnap = (id) => {
    setStudy((prev) => ({
      ...prev,
      snaps: prev.snaps.filter((item) => item.id !== id),
    }));
  };

  const removeVideo = (id) => {
    setStudy((prev) => ({
      ...prev,
      videos: prev.videos.filter((item) => item.id !== id),
    }));
  };

  const dataChange = (field, value) => {
    if (field === "slug") {
      setStudy((prev) => ({ ...prev, slug: value }));
    } else {
      setStudy((prev) => ({
        ...prev,
        [field]: { ...prev[field], [activeLang]: value },
      }));
    }
  };

  const handleAddTag = (event) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      if (!study.tags.includes(inputValue.trim())) {
        setStudy((prev) => ({
          ...prev,
          tags: [...study.tags, inputValue.trim()],
        }));
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setStudy((prev) => ({
      ...prev,
      tags: study.tags.filter((_, index) => index !== indexToRemove),
    }));
  };

  const addApplication = () => {
    setStudy((prev) => ({
      ...prev,
      applications: [
        ...prev.applications,
        { id: nanoid(), text: { en: "", ar: "" } },
      ],
    }));
  };

  const updateApplication = (id, value) => {
    setStudy((prev) => ({
      ...prev,
      applications: prev.applications.map((app) =>
        app.id === id
          ? { ...app, text: { ...app.text, [activeLang]: value } }
          : app
      ),
    }));
  };

  const removeApplication = (id) => {
    setStudy((prev) => ({
      ...prev,
      applications: prev.applications.filter((app) => app.id !== id),
    }));
  };

  const addFeature = () => {
    setStudy((prev) => ({
      ...prev,
      features: [...prev.features, { id: nanoid(), text: { en: "", ar: "" } }],
    }));
  };

  const updateFeature = (id, value) => {
    setStudy((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, text: { ...f.text, [activeLang]: value } } : f
      ),
    }));
  };

  const removeFeature = (id) => {
    setStudy((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
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
    if (study.tags.length === 0) {
      toast.error(t("noTagsWarning"));
      return;
    }
    if (!study.banner) {
      toast.error(t("addBanner"));
      return;
    }
    try {
      setLoading(true);
      const studyId = nanoid();

      let bannerData = null;
      if (study.banner) {
        bannerData = await handleImageUpload(
          study.banner,
          `content/case-studies/study-${studyId}/banner`
        );
      }

      const snaps = [];
      for (const item of study.snaps) {
        const uploaded = await handleImageUpload(
          item.file,
          `content/case-studies/study-${studyId}/${item.id}`
        );
        snaps.push({ ...uploaded, id: item.id });
      }

      const docRef = doc(db, "case-studies", studyId);

      await setDoc(docRef, {
        ...study,
        banner: bannerData,
        snaps: snaps,
      });

      toast.success(c("saveSuccess"));
      setStudy({
        title: { en: "", ar: "" },
        service: { en: "", ar: "" },
        tags: [],
        banner: null,
        slug: "",
        description: { en: "", ar: "" },
        applications: [],
        features: [],
        snaps: [],
        videos: [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to add case study");
    } finally {
      setLoading(false);
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

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="studyTitle" className="form-label mb-2">
            {t("title")}
          </label>
          <input
            type="text"
            className="form-control"
            value={study.title[activeLang]}
            onChange={(e) => dataChange("title", e.target.value)}
            required
            id="studyTitle"
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="studyService" className="form-label mb-2">
            {t("service")}
          </label>
          <input
            type="text"
            className="form-control"
            value={study.service[activeLang]}
            onChange={(e) => dataChange("service", e.target.value)}
            required
            id="studyService"
            dir={activeLang === "en" ? "ltr" : "rtl"}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="studySlug" className="form-label mb-3">
            {t("slug")}
          </label>
          <input
            type="text"
            className="form-control"
            value={study.slug}
            id="studySlug"
            onChange={(e) => dataChange("slug", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="studySlug" className="form-label mb-3">
            {t("tags")}
          </label>
          <div
            className="tags-input-container"
            style={{ borderRadius: "10px" }}
          >
            {study.tags.map((tag, index) => (
              <div key={index} className="tag">
                {tag}
                <span
                  className="remove-tag"
                  onClick={() => handleRemoveTag(index)}
                >
                  &times;
                </span>
              </div>
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Enter here"
              className="form-control no-focus"
              style={{ border: 0, flex: 1, minWidth: "50px" }}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="form-label mb-3">{t("description")}</label>
          <JoditEditor
            ref={editor}
            config={config}
            value={study.description[activeLang]}
            tabIndex={1}
            onBlur={(newContent) => dataChange("description", newContent)}
            onChange={() => {}}
          />
        </div>

        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <label className="form-label mb-0">{t("applications")}</label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addApplication}
            >
              {c("add")}
            </button>
          </div>

          {study.applications.map((app) => (
            <div key={app.id} className="d-flex align-items-center gap-2 mb-2">
              <input
                type="text"
                className="form-control"
                value={app.text[activeLang]}
                onChange={(e) => updateApplication(app.id, e.target.value)}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => removeApplication(app.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <label className="form-label mb-0">{t("features")}</label>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addFeature}
            >
              {c("add")}
            </button>
          </div>

          {study.features.map((f) => (
            <div key={f.id} className="d-flex align-items-center gap-2 mb-2">
              <input
                type="text"
                className="form-control"
                value={f.text[activeLang]}
                onChange={(e) => updateFeature(f.id, e.target.value)}
                dir={activeLang === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => removeFeature(f.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5 d-flex align-items-center justify-content-between">
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
        {study.banner && (
          <img
            src={URL.createObjectURL(study.banner)}
            alt="banner"
            style={{ width: "400px", borderRadius: "12px" }}
            className="mb-4"
          />
        )}

        <div className="mb-4 d-flex align-items-center justify-content-between">
          <label className="form-label mb-0">{t("snaps")}</label>
          <input
            type="file"
            id="snapsInput"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={selectImages}
          />

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => document.getElementById("snapsInput").click()}
          >
            {c("add")}
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {study.snaps.map((item) => (
            <div key={item.id} style={{ position: "relative" }}>
              <img
                src={URL.createObjectURL(item.file)}
                alt="gallery"
                width={300}
                style={{ borderRadius: "8px" }}
              />
              <button
                type="button"
                onClick={() => removeSnap(item.id)}
                style={{ position: "absolute", top: 0, right: 0 }}
                className="btn btn-sm btn-danger"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="mb-3 d-flex align-items-center justify-content-between">
          <label className="form-label mb-0">{t("videos")}</label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowModal(true)}
          >
            {c("add")}
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-5">
          {study.videos.map((item) => (
            <div key={item.id} style={{ position: "relative" }}>
              <iframe
                width={300}
                src={convertYoutubeUrl(item.url)}
                style={{ borderRadius: "8px" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <button
                type="button"
                onClick={() => removeVideo(item.id)}
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

      {/* Modal */}
      {showModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content p-3">
              <div className="modal-header d-flex justify-content-between mb-2">
                <h5 className="modal-title">{t("addVideo")}</h5>
                <IoMdClose
                  style={{ cursor: "pointer", width: "24px", height: "24px" }}
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={addVideo}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                  />
                  <div className="mt-2">
                    <button type="submit" className="btn btn-primary">
                      {t("addVideo")}
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
