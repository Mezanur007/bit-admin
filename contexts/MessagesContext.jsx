"use client";
import { db } from "@/configuration/firebase-config";
import { doc, onSnapshot, collection } from "firebase/firestore";
import React, { createContext, useContext, useState, useEffect } from "react";

const MessagesContext = createContext();

export const useMessages = () => useContext(MessagesContext);

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadMessages = messages.filter((msg) => !msg.read).length;

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onSnapshot(
        collection(db, "messages"),
        (snapshot) => {
          const fetchedMessages = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setMessages(fetchedMessages);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching messages:", error);
        }
      );
    } catch (error) {
      console.error("Failed to set up snapshot listener:", error);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <MessagesContext.Provider
      value={{ messages, setMessages, loading, unreadMessages }}
    >
      {children}
    </MessagesContext.Provider>
  );
};
