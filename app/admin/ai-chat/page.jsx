"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { db } from "@/configuration/firebase-config";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import useAuth from "@/hooks/UseAuth";
import Loading from "@/components/Loading";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";

const STATUS_TABS = ["all", "new", "active", "waiting", "closed"];

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_COLORS = {
  new: "bg-primary",
  active: "bg-success",
  waiting: "bg-warning text-dark",
  closed: "bg-secondary",
};

export default function AiChatPage() {
  const { loading, user, isAdmin } = useAuth();
  const router = useRouter();
  const locale = useLocale();

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [loading, user, isAdmin]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const q = query(
      collection(db, "conversations"),
      where("deletedAt", "==", null),
      orderBy("lastMessageAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setConversations(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsub();
  }, [user, isAdmin]);

  if (loading) return <Loading />;
  if (!user || !isAdmin) return <Loading />;

  const filtered = conversations.filter((c) => {
    const matchSearch =
      !search ||
      (c.visitorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessagePreview || "").toLowerCase().includes(search.toLowerCase());

    const matchTab =
      activeTab === "all" || (c.status || "new") === activeTab;

    return matchSearch && matchTab;
  });

  return (
    <div style={{ paddingTop: "80px" }}>
      <div className="d-flex align-items-center gap-2 mb-4">
        <SmartToyOutlinedIcon style={{ fontSize: 28, color: "#6c63ff" }} />
        <h3 className="mb-0 fw-bold">AI Chat</h3>
      </div>

      {/* Search */}
      <div className="position-relative mb-3" style={{ maxWidth: 400 }}>
        <SearchIcon
          style={{
            position: "absolute",
            top: "50%",
            [locale === "ar" ? "right" : "left"]: 10,
            transform: "translateY(-50%)",
            color: "#aaa",
          }}
        />
        <input
          type="text"
          className="form-control"
          style={{
            paddingLeft: locale === "ar" ? "12px" : "36px",
            paddingRight: locale === "ar" ? "36px" : "12px",
          }}
          placeholder="Search by name or message…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Status tabs */}
      <ul className="nav nav-tabs mb-3">
        {STATUS_TABS.map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link text-capitalize ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-muted py-5 text-center">
          No conversations found.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Visitor</th>
                <th>Last Message</th>
                <th>Status</th>
                <th>Time</th>
                <th>Unread</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((conv) => (
                <tr
                  key={conv.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push(`/admin/ai-chat/${conv.id}`)}
                >
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <PersonOutlineIcon style={{ color: "#888" }} />
                      <span className="fw-semibold">
                        {conv.visitorName || "Anonymous"}
                      </span>
                    </div>
                  </td>
                  <td
                    className="text-muted"
                    style={{
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conv.lastMessagePreview || "—"}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        STATUS_COLORS[conv.status || "new"] || "bg-primary"
                      }`}
                    >
                      {conv.status || "new"}
                    </span>
                  </td>
                  <td className="text-muted small">
                    {conv.lastMessageAt
                      ? timeAgo(conv.lastMessageAt.toDate())
                      : "—"}
                  </td>
                  <td>
                    {conv.unreadCount > 0 && (
                      <span className="badge rounded-pill bg-danger">
                        {conv.unreadCount}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
