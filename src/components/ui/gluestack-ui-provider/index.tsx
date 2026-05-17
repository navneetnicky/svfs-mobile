import { config } from "./config";
import { colorScheme, OverlayProvider } from "@gluestack-ui/nativewind-utils";
import React, { createContext, useContext } from "react";

type ModeType = "light" | "dark" | "system";

const GluestackUIContext = createContext<{ mode: ModeType }>({
  mode: "light",
});

export function GluestackUIProvider({
  mode = "light",
  children,
}: {
  mode?: ModeType;
  children: React.ReactNode;
}) {
  colorScheme.set(mode);

  return (
    <GluestackUIContext.Provider value={{ mode }}>
      <OverlayProvider>
        <>{children}</>
      </OverlayProvider>
    </GluestackUIContext.Provider>
  );
}

export const useGluestackUIContext = () => useContext(GluestackUIContext);
