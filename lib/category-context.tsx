"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Category = { id: number; name: string };

const CategoryContext = createContext<{
  categories: Category[];
  refresh: () => Promise<void>;
}>({
  categories: [],
  refresh: async () => {},
});

export function CategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<Category[]>([]);

  async function refresh() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (res.ok) setCategories(await res.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, refresh }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}
