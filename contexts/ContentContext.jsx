"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/configuration/firebase-config";
import { doc, onSnapshot, collection } from "firebase/firestore";

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [faq, setFaq] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [terms, setTerms] = useState({});
  const [termsLoading, setTermsLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "content", "partners");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPartners(data.partners || []);
        } else {
          setPartners([]);
        }
        setPartnersLoading(false);
      },
      (error) => {
        console.error("Error fetching partners:", error);
        setPartnersLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "faq");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setFaq(data.faq || []);
        } else {
          setFaq([]);
        }
        setFaqLoading(false);
      },
      (error) => {
        console.error("Error fetching faq:", error);
        setFaqLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "terms");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTerms(data);
        }
        setTermsLoading(false);
      },
      (error) => {
        console.error("Error fetching terms:", error);
        setTermsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ContentContext.Provider
      value={{
        partners,
        setPartners,
        partnersLoading,
        faq,
        faqLoading,
        terms,
        termsLoading,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
