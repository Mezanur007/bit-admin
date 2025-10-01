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

export default function MonthlyAchievers() {
  const { monthly, monthlyLoading: loading } = useContent();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("monthly");
  const c = useTranslations("common");
  const [deletingIds, setDeletingIds] = useState([]);

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(24, monthly.length);

  const currentRecords = monthly.slice(startPageIndex, endPageIndex);

  const handleDelete = async (record) => {
    if (!window.confirm(c("confirmDelete"))) return;
    setDeletingIds((prev) => [...prev, record.id]);
    try {
      await fetch("/api/delete-folder", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucket: "bit-content-images",
          folder: `achievers/monthly/record-${record.id}/`,
        }),
      });

      await deleteDoc(doc(db, "monthly-achievers", record.id));

      toast.success(c("deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete achiever recod:", error);
      toast.error(c("deletedFail"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== record.id));
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
          onClick={() => router.push(`/admin/add-monthly`)}
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
      ) : monthly.length === 0 ? (
        <h5 className="text-center my-5">{t("noAchievers")}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentRecords.map((record) => {
              return (
                <div className="col" key={record.id}>
                  <div
                    className="card h-100 shadow-lg overflow-hidden p-3 transition-transform hover:scale-105"
                    style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
                  >
                    <div
                      className="mb-3 position-relative w-full overflow-hidden"
                      style={{
                        aspectRatio: "1",
                        borderRadius: "12px",
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <img
                        src={record.image.url}
                        alt={record.name[locale]}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s",
                        }}
                        className="hover:scale-110"
                        loading="lazy"
                      />
                    </div>

                    <div className="text-muted mb-3 small">
                      {record.month
                        ? new Date(record.month + "-01").toLocaleString(
                            locale,
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </div>

                    <div className="d-flex flex-column gap-1">
                      <div
                        className="fw-bold mb-1 text-truncate"
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {record.name[locale]}
                      </div>

                      <div className="text-secondary small mb-2">
                        {record.designation[locale]}
                      </div>

                      <div
                        className="text-muted mb-3"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {record.description[locale]}
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className={`btn btn-warning text-white flex-grow-1`}
                          onClick={() =>
                            router.push(`/admin/edit-monthly/${record.id}`)
                          }
                          title={c("edit")}
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          className="btn btn-danger flex-grow-1"
                          onClick={() => handleDelete(record)}
                          title={c("delete")}
                          disabled={deletingIds.includes(record.id)}
                        >
                          {deletingIds.includes(record.id) ? (
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
