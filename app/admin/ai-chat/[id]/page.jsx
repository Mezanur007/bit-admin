"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/configuration/firebase-config";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import useAuth from "@/hooks/UseAuth";
import Loading from "@/components/Loading";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

const STATUS_OPTIONS = ["new", "active", "waiting", "closed"];

const STATUS_COLORS = {
  new: "#0d6efd",
  active: "#198754",
  waiting: "#ffc107",
  closed: "#6c757d",
};

function timeLabel(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

function extractLeadMetadata(messages) {
  const metadata = {
    contact: "",
    brief: "",
    preferredMeetingSlot: "",
  };

  for (const message of messages) {
    if (
      (message?.senderType !== "visitor" && message?.senderType !== "bot") ||
      typeof message?.messageText !== "string"
    ) {
      continue;
    }

    const text = message.messageText.trim();

    if (!metadata.contact && text.startsWith("Contact details:")) {
      const contactLine = text.slice("Contact details:".length).trim();
      const [, contact = ""] = contactLine.split("|").map((part) => part.trim());
      metadata.contact = contact || contactLine;
      continue;
    }

    if (!metadata.brief && text.startsWith("Project brief:")) {
      metadata.brief = text.slice("Project brief:".length).trim();
      continue;
    }

    if (!metadata.preferredMeetingSlot && text.startsWith("Preferred meeting slot:")) {
      metadata.preferredMeetingSlot = text
        .slice("Preferred meeting slot:".length)
        .trim();
    }

    if (message.senderType !== "bot") {
      continue;
    }

    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    for (const line of lines) {
      if (!metadata.contact && (line.startsWith("Email:") || line.startsWith("Mobile:"))) {
        metadata.contact = line.slice(line.indexOf(":") + 1).trim();
        continue;
      }

      if (!metadata.preferredMeetingSlot && line.startsWith("Date:")) {
        metadata.preferredMeetingSlot = line.slice("Date:".length).trim();
        continue;
      }

      if (!metadata.brief && line.startsWith("Brief:")) {
        metadata.brief = line.slice("Brief:".length).trim();
      }
    }
  }

  return metadata;
}

export default function ConversationDetailPage({ params }) {
  const { id } = use(params);
  const { loading, user, isAdmin } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!user || !isAdmin || !id) return;
    const unsub = onSnapshot(doc(db, "conversations", id), (snap) => {
      if (snap.exists()) {
        setConversation({ id: snap.id, ...snap.data() });
      }
    });
    return () => unsub();
  }, [user, isAdmin, id]);

  useEffect(() => {
    if (!user || !isAdmin || !id) return;
    const messagesQuery = query(
      collection(db, "conversations", id, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(messagesQuery, (snap) => {
      setMessages(snap.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
    });
    return () => unsub();
  }, [user, isAdmin, id]);

  useEffect(() => {
    if (!user || !isAdmin || !id) return;
    fetch("/api/admin-chat/conversation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: id, updates: { unreadCount: 0 } }),
    });
  }, [id, user, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await fetch("/api/admin-chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id,
          text: trimmed,
          adminName: user?.displayName || user?.email || "Admin",
        }),
      });
      setText("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", id);

      const res = await fetch("/api/admin-chat/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        await fetch("/api/admin-chat/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: id,
            text: "",
            fileUrl: data.url,
            fileName: data.fileName,
            mimeType: data.mimeType,
            adminName: user?.displayName || user?.email || "Admin",
          }),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      await fetch("/api/admin-chat/conversation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id,
          updates: { status: newStatus },
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setStatusChanging(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch("/api/admin-chat/conversation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id }),
      });
      router.push("/admin/ai-chat");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading />;
  if (!user || !isAdmin) return <Loading />;

  const leadMetadata = extractLeadMetadata(messages);
  const contactValue =
    conversation?.visitorEmail ||
    conversation?.visitorMobile ||
    leadMetadata.contact ||
    "-";

  const renderMessage = (msg) => {
    const isBot = msg.senderType === "bot";
    const isAdminMsg = msg.senderType === "admin";
    const msgText = msg.messageText;

    const fileContent = msg.fileUrl ? (
      msg.mimeType?.startsWith("image/") ? (
        <img
          src={msg.fileUrl}
          alt={msg.fileName || "image"}
          style={{ maxWidth: 220, borderRadius: 8 }}
        />
      ) : (
        <a
          href={msg.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="text-decoration-underline"
        >
          Attachment: {msg.fileName || "Download file"}
        </a>
      )
    ) : null;

    const body = fileContent || (
      <span style={{ whiteSpace: "pre-wrap" }}>{msgText}</span>
    );

    if (isBot) {
      return (
        <div key={msg.id} className="d-flex justify-content-center mb-3">
          <div
            className="px-3 py-2 rounded"
            style={{
              background: "#f0f0f0",
              color: "#555",
              fontStyle: "italic",
              maxWidth: "70%",
              fontSize: 14,
            }}
          >
            <SmartToyOutlinedIcon
              style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}
            />
            {body}
            <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
              {timeLabel(msg.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    if (isAdminMsg) {
      return (
        <div key={msg.id} className="d-flex justify-content-start mb-3">
          <div
            className="px-3 py-2 rounded border"
            style={{ background: "#fff", maxWidth: "70%", fontSize: 14 }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#6c63ff",
                marginBottom: 2,
                fontWeight: 600,
              }}
            >
              {msg.senderName || "Admin"}
            </div>
            {body}
            <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
              {timeLabel(msg.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className="d-flex justify-content-end mb-3">
        <div
          className="px-3 py-2 rounded text-white"
          style={{
            background: "linear-gradient(135deg, #6c63ff, #3b82f6)",
            maxWidth: "70%",
            fontSize: 14,
          }}
        >
          {body}
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>
            {timeLabel(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        paddingTop: "80px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          className="btn btn-light btn-sm"
          onClick={() => router.push("/admin/ai-chat")}
        >
          <ArrowBackIcon style={{ fontSize: 18 }} />
        </button>
        <h5 className="mb-0 fw-bold">{conversation?.visitorName || "Chat"}</h5>
        {conversation?.status && (
          <span
            className="badge ms-2"
            style={{
              background: STATUS_COLORS[conversation.status] || "#ccc",
              color: conversation.status === "waiting" ? "#000" : "#fff",
            }}
          >
            {conversation.status}
          </span>
        )}
      </div>

      <div className="d-flex gap-3 flex-grow-1" style={{ overflow: "hidden" }}>
        <div
          className="flex-grow-1 d-flex flex-column border rounded bg-white"
          style={{ overflow: "hidden" }}
        >
          <div className="p-3 flex-grow-1" style={{ overflowY: "auto" }}>
            {messages.length === 0 && (
              <div className="text-muted text-center py-5">No messages yet.</div>
            )}
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-top p-2 d-flex align-items-end gap-2">
            <textarea
              className="form-control"
              rows={2}
              placeholder="Type a reply... (Enter to send, Shift+Enter for newline)"
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              style={{ resize: "none", fontSize: 14 }}
              disabled={sending}
            />
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              className="btn btn-outline-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Attach file"
            >
              {uploading ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <AttachFileIcon style={{ fontSize: 20 }} />
              )}
            </button>
            <button
              className="btn text-white"
              style={{ background: "linear-gradient(135deg, #6c63ff, #3b82f6)" }}
              onClick={handleSend}
              disabled={sending || !text.trim()}
            >
              {sending ? (
                <span className="spinner-border spinner-border-sm" role="status" />
              ) : (
                <SendIcon style={{ fontSize: 20 }} />
              )}
            </button>
          </div>
        </div>

        <div
          className="border rounded bg-white p-3 d-flex flex-column gap-3"
          style={{ width: 260, flexShrink: 0, overflowY: "auto" }}
        >
          <div>
            <h6 className="fw-bold mb-2">Visitor Info</h6>
            <div className="d-flex flex-column gap-1 small">
              <div>
                <span className="text-muted">Name: </span>
                {conversation?.visitorName || "-"}
              </div>
              <div>
                <span className="text-muted">Email: </span>
                {conversation?.visitorEmail || "-"}
              </div>
              <div>
                <span className="text-muted">Mobile: </span>
                {conversation?.visitorMobile || "-"}
              </div>
              <div>
                <span className="text-muted">Best Contact: </span>
                {contactValue}
              </div>
              {conversation?.locale && (
                <div>
                  <span className="text-muted">Locale: </span>
                  <span className="badge bg-secondary">{conversation.locale}</span>
                </div>
              )}
            </div>
          </div>

          {(leadMetadata.preferredMeetingSlot || leadMetadata.brief) && (
            <div>
              <h6 className="fw-bold mb-2">Booking Details</h6>
              <div className="d-flex flex-column gap-2 small">
                {leadMetadata.preferredMeetingSlot && (
                  <div>
                    <div className="text-muted">Preferred Meeting Slot</div>
                    <div>{leadMetadata.preferredMeetingSlot}</div>
                  </div>
                )}
                {leadMetadata.brief && (
                  <div>
                    <div className="text-muted">Project Brief</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{leadMetadata.brief}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <h6 className="fw-bold mb-2">Status</h6>
            <select
              className="form-select form-select-sm"
              value={conversation?.status || "new"}
              onChange={(event) => handleStatusChange(event.target.value)}
              disabled={statusChanging}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-auto">
            {deleteConfirm ? (
              <div className="d-flex flex-column gap-2">
                <div className="small text-danger">
                  This will hide the conversation from the list.
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-danger btn-sm flex-grow-1"
                    onClick={handleDelete}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-outline-danger btn-sm w-100"
                onClick={() => setDeleteConfirm(true)}
              >
                <DeleteOutlineIcon style={{ fontSize: 16 }} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
