"use client";
import React, { useState } from "react";
import { useContent } from "@/contexts/ContentContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "@/configuration/firebase-config";
import { ref, deleteObject, listAll } from "firebase/storage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import Link from "next/link";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

export default function CaseStudies() {
  const { caseStudies, caseStudiesLoading: loading } = useContent();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("caseStudies");
  const c = useTranslations("common");
  const [deletingIds, setDeletingIds] = useState([]);

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, caseStudies.length);

  const currentStudies = caseStudies.slice(startPageIndex, endPageIndex);

  const deleteFolderContent = async (listRef) => {
    listAll(listRef)
      .then((res) => {
        res.items.forEach(async (itemRef) => {
          await deleteObject(itemRef);
        });
      })
      .catch((error) => {
        console.log("error deleting the folder", error);
      });
  };

  const handleDelete = async (study) => {
    if (!window.confirm(c("confirmDelete"))) return;
    setDeletingIds((prev) => [...prev, study.id]);
    try {
      const folderRef = ref(storage, `case-studies/study-${study.id}`);
      deleteFolderContent(folderRef);

      await deleteDoc(doc(db, "case-studies", study.id));

      toast.success(c("deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete case study:", error);
      toast.error(c("deletedFail"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== study.id));
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
          onClick={() => router.push(`/admin/add-study`)}
        >
          {c("add")}
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : caseStudies.length === 0 ? (
        <h5 className="text-center my-5">{t("noStudies")}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentStudies.map((study) => {
              return (
                <div className="col" key={study.id}>
                  <div className="card h-100 shadow-sm rounded-3 overflow-hidden">
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        paddingTop: "56.25%",
                        backgroundColor: "#f0f0f0",
                        overflow: "hidden",
                      }}
                      className="card-img-top"
                    >
                      <img
                        src={study.banner.url}
                        alt={study.title[locale]}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="mb-3 d-flex flex-wrap gap-2">
                        {study.tags.map((tag, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: "lightgrey",
                              borderRadius: "12px",
                              padding: "3px 10px",
                            }}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                      <div
                        className="mb-3 clamp-3 fw-semibold flex-grow-1"
                        style={{ fontWeight: "600" }}
                      >
                        {study.title[locale]}
                      </div>
                      <div className="d-flex">
                        <div
                          className={`btn btn-warning text-white ${
                            locale === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(`/admin/edit-study/${study.id}`)
                          }
                          title={c("edit")}
                        >
                          <FaPencilAlt />
                        </div>
                        <div
                          className="btn btn-danger"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDelete(study)}
                          title={c("delete")}
                          disabled={deletingIds.includes(study.id)}
                        >
                          {deletingIds.includes(study.id) ? (
                            <div
                              className="spinner-border spinner-border-sm text-light"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <FaTrash />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {caseStudies.length > 20 && (
            <div className="d-flex justify-content-center">
              <Pagination
                count={totalPages}
                page={currentPageIndex}
                onChange={(event, page) => displayPage(page)}
                className="custom-pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
