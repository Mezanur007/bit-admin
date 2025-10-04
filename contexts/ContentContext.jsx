"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/configuration/firebase-config";
import { doc, onSnapshot, collection } from "firebase/firestore";

const ContentContext = createContext();

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [partnersContent, setPartnersContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
    partners: [],
  });
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
  });
  const [serviceContent, setServiceContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
    featuresHeadline: { en: "", ar: "" },
    featuresCopy: { en: "", ar: "" },
    benefitsHeadline: { en: "", ar: "" },
    benefitsCopy: { en: "", ar: "" },
    processHeadline: { en: "", ar: "" },
    processCopy: { en: "", ar: "" },
    services: [],
  });
  const [serviceLoading, setServiceLoading] = useState(false);
  const [homeData, setHomeData] = useState({
    hero: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      buttonText: { en: "", ar: "" },
    },
    highlights: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      items: [],
    },
    security: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      points: [],
    },
    marketLeader: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      items: [],
      findMoreText: { en: "", ar: "" },
    },
    aboutSection: {
      headline: { en: "", ar: "" },
      copy: { en: "", ar: "" },
      points: [],
      projects: { count: 0, text: { en: "", ar: "" } },
      members: { count: 0, text: { en: "", ar: "" } },
      experience: { count: 0, text: { en: "", ar: "" } },
      clients: { count: 0, text: { en: "", ar: "" } },
    },
    specialServices: {
      headline: { en: "", ar: "" },
      services: [],
    },
  });
  const [newsletter, setNewsletter] = useState({
    subscribers: [],
    subscriberTimestamps: {},
  });
  const [newsLetterLoading, setNewsLetterLoading] = useState(true);
  const [newsletterContent, setNewsletterContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
    buttonText: { en: "", ar: "" },
  });
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [gallery, setGallery] = useState({
    categories: [],
    items: [],
  });
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [caseStudies, setCaseStudies] = useState([]);
  const [caseStudiesLoading, setCaseStudiesLoading] = useState(true);
  const [quarterly, setQuarterly] = useState([]);
  const [quarterlyLoading, setQuarterlyLoading] = useState(true);
  const [monthly, setMonthly] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [achieversContent, setAchieversContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
  });
  const [caseStudiesContent, setCaseStudiesContent] = useState({
    headline: { en: "", ar: "" },
    copy: { en: "", ar: "" },
  });

  useEffect(() => {
    const docRef = doc(db, "content", "partners");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPartnersContent(data);
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
      },
      (error) => {
        console.error("Error fetching techs:", error);
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

  useEffect(() => {
    const docRef = doc(db, "content", "home");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setHomeData(data);
        }
      },
      (error) => {
        console.error("Error fetching home data:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "subscribers");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setNewsletter(docSnap.data());
        }
        setNewsLetterLoading(false);
      },
      (error) => {
        console.error("Error fetching newsletter data:", error);
        setNewsLetterLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "newsletterContent");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setNewsletterContent(data);
        }
      },
      (error) => {
        console.error("Error fetching newsletter content:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "gallery");

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setGallery(docSnap.data());
        }
        setGalleryLoading(false);
      },
      (error) => {
        console.error("Error fetching gallery data:", error);
        setGalleryLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, "events"),
        (snapshot) => {
          const fetchedArticles = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setEvents(fetchedArticles);
          setEventsLoading(false);
        },
        (error) => {
          console.error("Error fetching events:", error);
        }
      );
    } catch (error) {
      console.error("Failed to set up snapshot listener:", error);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, "case-studies"),
        (snapshot) => {
          const fetchedStudies = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setCaseStudies(fetchedStudies);
          setCaseStudiesLoading(false);
        },
        (error) => {
          console.error("Error fetching case studies:", error);
        }
      );
    } catch (error) {
      console.error("Failed to set up snapshot listener:", error);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, "quarterly-achievers"),
        (snapshot) => {
          const fetchedRecords = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setQuarterly(fetchedRecords);
          setQuarterlyLoading(false);
        },
        (error) => {
          console.error("Error fetching quarterly achievers:", error);
        }
      );
    } catch (error) {
      console.error("Failed to set up snapshot listener:", error);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, "monthly-achievers"),
        (snapshot) => {
          const fetchedRecords = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setMonthly(fetchedRecords);
          setMonthlyLoading(false);
        },
        (error) => {
          console.error("Error fetching monthly achievers:", error);
        }
      );
    } catch (error) {
      console.error("Failed to set up snapshot listener:", error);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "achievers");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setAchieversContent(data);
        }
      },
      (error) => {
        console.error("Error fetching achievers content:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const docRef = doc(db, "content", "case-studies");

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setCaseStudiesContent(data);
        }
      },
      (error) => {
        console.error("Error fetching case studies content:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ContentContext.Provider
      value={{
        partnersContent,
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
        serviceContent,
        serviceLoading,
        homeData,
        newsletter,
        newsLetterLoading,
        newsletterContent,
        gallery,
        galleryLoading,
        events,
        eventsLoading,
        caseStudies,
        caseStudiesLoading,
        quarterly,
        quarterlyLoading,
        monthly,
        monthlyLoading,
        achieversContent,
        caseStudiesContent,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
