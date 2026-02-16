"use client";
import { createContext, useContext, useState } from "react";

type NavbarMode = "light" | "dark";

const NavbarContext = createContext<{
  mode: NavbarMode;
  setMode: (m: NavbarMode) => void;
}>({
  mode: "dark",
  setMode: () => {},
});

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<NavbarMode>("dark");

  return (
    <NavbarContext.Provider value={{ mode, setMode }}>
      {children}
    </NavbarContext.Provider>
  );
}

export const useNavbar = () => useContext(NavbarContext);
