"use client";
import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { db } from "@/configuration/firebase-config";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { IoMdClose } from "react-icons/io";
import { useContent } from "@/contexts/ContentContext";
import { toast } from "react-toastify";

export default function Terms() {
  const locale = useLocale();
  const t = useTranslations("terms");
  const c = useTranslations("common");
  const { terms } = useContent();

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
    </div>
  );
}
