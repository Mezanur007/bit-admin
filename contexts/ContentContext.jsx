"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/configuration/firebase-config";
import { doc, onSnapshot, collection } from "firebase/firestore";

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [faq, setFaq] = useState({ headline: { en: "", ar: "" }, faqs: [] });
  const [faqLoading, setFaqLoading] = useState(true);
  const [terms, setTerms] = useState({
    en: { headline: "", copy: "", content: "" },
    ar: { headline: "", copy: "", content: "" },
  });
  const [privacy, setPrivacy] = useState({
    en: { headline: "", copy: "", content: "" },
    ar: { headline: "", copy: "", content: "" },
  });
  const [about, setAbout] = useState({
    hero: { headline: { en: "", ar: "" }, copy: { en: "", ar: "" } },
    missionVisionSection: {
      title: { en: "", ar: "" },
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      mission: {
        headline: { en: "", ar: "" },
        copy: { en: "", ar: "" },
        image: { url: "", path: "" },
      },
      vision: {
        headline: { en: "", ar: "" },
        copy: { en: "", ar: "" },
        image: { url: "", path: "" },
      },
    },
    features: [],
    howWeWorkSection: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
    },
    howWeWorkSteps: [],
    cta: {
      copy: { en: "", ar: "" },
      buttonText: { en: "", ar: "" },
    },
    coreValuesSection: {
      title: { en: "", ar: "" },
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
    },
    coreValuesItems: [],
  });
  const [contactUs, setContactUs] = useState({
    heroHeadline: { en: "", ar: "" },
    heroCopy: { en: "", ar: "" },
    contactHeadline: { en: "", ar: "" },
    contactCopy: { en: "", ar: "" },
    ctaHeadline: { en: "", ar: "" },
    ctaCopy: { en: "", ar: "" },
    ctaButton: { en: "", ar: "" },
  });
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    phone1: "",
    email: "",
    address: { en: "", ar: "" },
  });
  const [portfolio, setPortfolio] = useState({
    hero: { headline: { en: "", ar: "" }, copy: { en: "", ar: "" } },
    categories: [],
    projects: [],
    howWeWork: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      items: [],
    },
    cta: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      button1: { en: "", ar: "" },
      button2: { en: "", ar: "" },
    },
  });
  const [techContent, setTechContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
    techs: [],
  });
  const [techLoading, setTechLoading] = useState(true);
  const [serviceContent, setServiceContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
    services: [],
  });
  const [serviceLoading, setServiceLoading] = useState(false);

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
          setFaq({ faqs: data.faqs, headline: data.headline });
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
      },
      (error) => {
        console.error("Error fetching terms:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "privacy");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPrivacy(data);
        }
      },
      (error) => {
        console.error("Error fetching privacy:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "about");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setAbout(data);
        }
      },
      (error) => {
        console.error("Error fetching about page content:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "contactUs");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setContactUs(data);
        }
      },
      (error) => {
        console.error("Error fetching contact page content:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "contactInfo");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setContactInfo(data);
        }
      },
      (error) => {
        console.error("Error fetching contact info:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "portfolio");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPortfolio(data);
        }
      },
      (error) => {
        console.error("Error fetching portfolio page content:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "technologies");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTechContent(data);
        }
        setTechLoading(false);
      },
      (error) => {
        console.error("Error fetching techs:", error);
        setTechLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "services");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setServiceContent(data);
        }
        setServiceLoading(false);
      },
      (error) => {
        console.error("Error fetching services:", error);
        setServiceLoading(false);
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
        privacy,
        about,
        contactUs,
        contactInfo,
        portfolio,
        techContent,
        techLoading,
        serviceContent,
        serviceLoading
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
