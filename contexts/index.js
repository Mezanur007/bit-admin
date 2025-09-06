"use client";

import { MessagesProvider } from "./MessagesContext";
import { ArticlesProvider } from "./ArticlesContext";
import { ContentProvider } from "./ContentContext";

export const AppProviders = ({ children }) => {
  return (
    <ContentProvider>
      <MessagesProvider>
        <ArticlesProvider>{children}</ArticlesProvider>
      </MessagesProvider>
    </ContentProvider>
  );
};
