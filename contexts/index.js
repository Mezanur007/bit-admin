"use client";

import { MessagesProvider } from "./MessagesContext";
import { ArticlesProvider } from "./ArticlesContext";
import { ContentProvider } from "./ContentContext";
import { AuthProvider } from "./AuthContext";

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ContentProvider>
        <MessagesProvider>
          <ArticlesProvider>{children}</ArticlesProvider>
        </MessagesProvider>
      </ContentProvider>
    </AuthProvider>
  );
};
