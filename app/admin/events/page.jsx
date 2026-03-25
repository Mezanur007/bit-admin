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

export default function Events() {
  const { events, eventsLoading: loading } = useContent();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("events");
  const c = useTranslations("common");
  const [deletingIds, setDeletingIds] = useState([]);

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, events.length);

  const currentEvents = events.slice(startPageIndex, endPageIndex);

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

  const handleDelete = async (event) => {
    if (!window.confirm(c("confirmDelete"))) return;
    setDeletingIds((prev) => [...prev, event.id]);
    try {
      const folderRef = ref(storage, `events/event-${event.id}`);
      deleteFolderContent(folderRef);

      await deleteDoc(doc(db, "events", event.id));

      toast.success(c("deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(c("deletedFail"));
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== event.id));
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
          onClick={() => router.push(`/admin/add-event`)}
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
      ) : events.length === 0 ? (
        <h5 className="text-center my-5">{t("noEvents")}</h5>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xxl-4 g-4 mb-5">
            {currentEvents.map((event) => {
              return (
                <div className="col" key={event.id}>
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
                        src={event.banner.url}
                        alt={event.title[locale]}
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
                      <div
                        className="mb-3 clamp-3 fw-semibold flex-grow-1"
                        style={{ fontWeight: "600" }}
                      >
                        {event.title[locale]}
                      </div>
                      <div className="d-flex">
                        <div
                          className={`btn btn-warning text-white ${
                            locale === "en" ? "me-2" : "ms-2"
                          }`}
                          onClick={() =>
                            router.push(`/admin/edit-event/${event.id}`)
                          }
                          title={c("edit")}
                        >
                          <FaPencilAlt />
                        </div>
                        <div
                          className="btn btn-danger"
                          style={{ backgroundColor: "red" }}
                          onClick={() => handleDelete(event)}
                          title={c("delete")}
                          disabled={deletingIds.includes(event.id)}
                        >
                          {deletingIds.includes(event.id) ? (
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
          {events.length > 20 && (
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
