
"use client";

import { createContext, useContext, useState } from "react";

type LoaderContextType = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(
  undefined
);

export function LoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        </div>
      )}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error(
      "useLoader must be used inside LoaderProvider"
    );
  }

  return context;
}

