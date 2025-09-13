"use client";
import { db } from "@/configuration/firebase-config";
import { onSnapshot, collection } from "firebase/firestore";
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuthData = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "admins"), (snapshot) => {
      const fetchedAdmins = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAdmins(fetchedAdmins);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ admins }}>{children}</AuthContext.Provider>
  );
};
