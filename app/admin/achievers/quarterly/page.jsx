"use client";
import React, { useState } from "react";
import { useContent } from "@/contexts/ContentContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/configuration/firebase-config";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import Link from "next/link";
import { FaTrash, FaPencilAlt } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

export default function QuarterlyAchievers() {
  const { quarterly, quarterlyLoading: loading } = useContent();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("quarterly");
  const c = useTranslations("common");
  const [deletingIds, setDeletingIds] = useState([]);

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(24, quarterly.length);

  const currentRecords = quarterly.slice(startPageIndex, endPageIndex);

  const handleDelete = async (record) => {
    if (!window.confirm(c("confirmDelete"))) return;
    setDeletingIds((prev) => [...prev, record.id]);
    try {
      await fetch("/api/delete-folder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "bit-content-images",
          folder: `achievers/quarterly/record-${record.id}/`,
        }),
      });

      await deleteDoc(doc(db, "quarterly-achievers", record.id));

      toast.success(c("deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete achiever recod:", error);
      toast.error(c("deletedFail"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== record.id));
    }
  };

  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + "-01");
    return date.toLocaleString(locale, { month: "long", year: "numeric" });
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
          onClick={() => router.push(`/admin/add-quarterly`)}
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
      ) : quarterly.length === 0 ? (
        <h5 className="text-center my-5">{t("noAchievers")}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentRecords.map((a) => {
              return (
                <div className="col" key={a.id}>
                  <div
                    key={a.id}
                    className="h-100 border border-1 p-3 d-flex flex-column"
                    style={{ borderRadius: "18px" }}
                  >
                    <div className="ratio ratio-1x1 bg-light mb-3">
                      <img
                        src={a.image.url}
                        alt={a.name[locale]}
                        className="card-img-top"
                        style={{ borderRadius: "12px", objectFit: "cover" }}
                        loading="lazy"
                      />
                    </div>

                    <div className="d-flex flex-column flex-grow-1">
                      <p className="fw-semibold text-success small mb-1 text-truncate">
                        🏆{" "}
                        {locale === "ar"
                          ? "موظف الربع"
                          : "Employee of the Quarter"}
                      </p>
                      <p className="text-muted fw-semibold small mb-2">
                        📅 {formatMonth(a.fromMonth)} - {formatMonth(a.toMonth)}
                      </p>
                      <h5 className="card-title fw-bold text-truncate mb-1">
                        {a.name[locale]}
                      </h5>
                      <p className="text-muted small mb-2 text-truncate">
                        {a.designation[locale]}
                      </p>
                      <p className="text-secondary small flex-grow-1 mb-3 clamp-3">
                        {a.description[locale]}
                      </p>
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          className="btn btn-warning text-white flex-fill"
                          onClick={() =>
                            router.push(`/admin/edit-quarterly/${a.id}`)
                          }
                          title={c("edit")}
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          className="btn btn-danger flex-fill"
                          onClick={() => handleDelete(a)}
                          title={c("delete")}
                          disabled={deletingIds.includes(a.id)}
                        >
                          {deletingIds.includes(a.id) ? (
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
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
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
