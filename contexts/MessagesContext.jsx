"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const MessagesContext = createContext();

export const useMessages = () => useContext(MessagesContext);

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadMessages = messages.filter((msg) => !msg.read).length;

  return (
    <MessagesContext.Provider
      value={{ messages, setMessages, loading, unreadMessages }}
    >
      {children}
    </MessagesContext.Provider>
  );
};
