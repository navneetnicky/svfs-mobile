import React, { createContext, useContext } from "react";

type ModeType = "light" | "dark" | "system";

const GluestackUIContext = createContext<{ mode: ModeType }>({ mode: "light" });

export function GluestackUIProvider({
  mode = "light",
  children,
}: {
  mode?: ModeType;
  children: React.ReactNode;
}) {
  return (
    <GluestackUIContext.Provider value={{ mode }}>
      {children}
    </GluestackUIContext.Provider>
  );
}

export const useGluestackUIContext = () => useContext(GluestackUIContext);
