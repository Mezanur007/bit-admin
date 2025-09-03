"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const ArticlesContext = createContext();

export const useArticles = () => useContext(ArticlesContext);

export const ArticlesProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //let unsubscribe;

    //try {
    //  unsubscribe = onSnapshot(
    //    collection(db, "articles"),
    //    (snapshot) => {
    //      const fetchedArticles = snapshot.docs.map((doc) => ({
    //        ...doc.data(),
    //        id: doc.id,
    //      }));
    //      setArticles(fetchedArticles);
    //    },
    //    (error) => {
    //      console.error("Error fetching articles:", error);
    //    }
    //  );
    //} catch (error) {
    //  console.error("Failed to set up snapshot listener:", error);
    //} finally {
    //  setLoading(false);
    //}

    //return () => {
    //  if (unsubscribe) unsubscribe();
    //};
    setLoading(false);
  }, []);

  return (
    <ArticlesContext.Provider value={{ articles, setArticles, loading }}>
      {children}
    </ArticlesContext.Provider>
  );
};
