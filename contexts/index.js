"use client";

import { MessagesProvider } from "./MessagesContext";
import { ArticlesProvider } from "./ArticlesContext";

export const AppProviders = ({ children }) => {
  return (
    <MessagesProvider>
      <ArticlesProvider>{children}</ArticlesProvider>
    </MessagesProvider>
  );
};
