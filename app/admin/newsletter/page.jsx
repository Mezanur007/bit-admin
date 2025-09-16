"use client";
import React, { useState, useEffect } from "react";
import { useContent } from "@/contexts/ContentContext";
import Pagination from "@mui/material/Pagination";
import usePagination from "@/hooks/UsePagination";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewsletterPage() {
  const locale = useLocale();
  const t = useTranslations("newsletter");
  const c = useTranslations("common");
  const router = useRouter();
  const { newsletter, newsLetterLoading: loading } = useContent();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [sortColumn, setSortColumn] = useState({
    path: "email",
    order: "asc",
  });

  const subscribers = newsletter.subscribers;
  const subscriberTimestamps = newsletter.subscriberTimestamps;

  const subscribersToDisplay =
    filteredSubscribers.length > 0 ? filteredSubscribers : subscribers;

  const {
    totalPages,
    startPageIndex,
    endPageIndex,
    currentPageIndex,
    setcurrentPageIndex,
    displayPage,
  } = usePagination(20, subscribersToDisplay);

  subscribersToDisplay.sort((a, b) => {
    const valueA = a[sortColumn.path];
    const valueB = b[sortColumn.path];
    let comparison = 0;

    if (sortColumn.path === "timestamp") {
      comparison = new Date(valueA) - new Date(valueB);
    } else {
      comparison = String(valueA).localeCompare(String(valueB));
    }

    return sortColumn.order === "asc" ? comparison : -comparison;
  });

  const currentSubscribers = subscribersToDisplay.slice(
    startPageIndex,
    endPageIndex
  );

  const filterSubscribers = (e) => {
    e.preventDefault();
    const filtered = subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    if (filtered.length > 0) {
      setFilteredSubscribers(filtered);
      setcurrentPageIndex(1);
    } else {
      toast(t("noSubscribersFound"));
    }
  };

  const handleSort = (path) => {
    if (sortColumn.path === path) {
      setSortColumn({
        ...sortColumn,
        order: sortColumn.order === "asc" ? "desc" : "asc",
      });
    } else setSortColumn({ path: path, order: "asc" });
  };

  const getSortIcon = (path) => {
    if (sortColumn.path === path) {
      return sortColumn.order === "asc" ? (
        <i className="fa fa-sort-asc text-dark"></i>
      ) : (
        <i className="fa fa-sort-desc text-dark"></i>
      );
    }
    return null;
  };

  const deleteSubscribe = async (id) => {
    const confirmDelete = window.confirm(t("deleteConfirm"));
    if (!confirmDelete) return;

    try {
      if (currentSubscribers.length === 1 && subscribersToDisplay.length > 20) {
        setcurrentPageIndex(currentPageIndex - 1);
      }
      const updatedSubscribers = subscribers.filter((sub) => sub.id !== id);
      const updatedTimestamps = { ...subscriberTimestamps };
      delete updatedTimestamps[id];
      const docRef = doc(db, "content", "subscribers");
      await updateDoc(docRef, {
        subscribers: updatedSubscribers,
        subscriberTimestamps: updatedTimestamps,
      });
      toast.success(t("deleteSuccess"));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      toast.error("Failed to delete subscriber");
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSubscribers([]);
    }
  }, [searchQuery]);

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
          onClick={() => router.push(`/admin/send-newsletter`)}
        >
          {t("sendLetter")}
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center my-5">
          <div className="spinner-border primary-color" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : subscribers.length > 0 ? (
        <>
          <form
            onSubmit={filterSubscribers}
            className="w-md-75 mb-5 position-relative"
          >
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              className="form-control"
              style={{
                height: "50px",
                paddingRight: locale === "en" ? "80px" : undefined,
                paddingLeft: locale === "ar" ? "80px" : undefined,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              required
            />
            <button
              type="submit"
              className="primaryButton border-0"
              style={{
                borderRadius: "8px",
                position: "absolute",
                right: locale === "en" ? "8px" : "auto",
                left: locale === "ar" ? "8px" : "auto",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <IoSearch style={{ width: "20px", height: "20px" }} />
            </button>
          </form>

          <div className="table-responsive mb-5">
            <table
              className="table table-hover table-borderless"
              style={{ whiteSpace: "nowrap" }}
            >
              <thead>
                <tr style={{ userSelect: "none" }}>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <h6>
                      {t("email")} {getSortIcon("email")}
                    </h6>
                  </th>
                  <th
                    className="text-secondary cursor-pointer"
                    onClick={() => handleSort("timestamp")}
                  >
                    <h6>
                      {t("joined")} {getSortIcon("timestamp")}
                    </h6>
                  </th>
                  <th className="text-secondary">
                    <h6>{t("action")}</h6>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentSubscribers.map((sub, index) => (
                  <tr key={sub.id}>
                    <td>{sub.email}</td>
                    <td>
                      {subscriberTimestamps[sub.id]
                        ?.toDate()
                        .toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </td>
                    <td>
                      <div
                        className="primaryButton d-inline-block py-1 px-2"
                        onClick={() => deleteSubscribe(sub.id)}
                        title={c("delete")}
                      >
                        <i className="fa fa-trash"></i>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {subscribersToDisplay.length > 20 && (
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
      ) : (
        <h6 className="text-center my-5">{t("noSubscribers")}</h6>
      )}
    </div>
  );
}
