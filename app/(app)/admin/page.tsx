"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";


import {
  BookOpen,
  CalendarDays,
  FileText,
  Users,
  Clock,
  House,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);
  
  const cards = [
    { label: "Messages", value: stats?.messages, icon: Mail },
    { label: "Sermons", value: stats?.sermons, icon: BookOpen },
    { label: "Bible Study", value: stats?.bibleStudy, icon: BookOpen },
    { label: "Events", value: stats?.events, icon: CalendarDays },
    // { label: "Articles", value: stats?.articles, icon: FileText },
    { label: "Congregations", value: stats?.directory, icon: House },
    { label: "Schedules", value: stats?.schedules, icon: Clock },
    { label: "Members", value: stats?.members, icon: Users },
    // { label: "Attendance", value: stats?.schedules, icon: CalendarDays },
    // { label: "History", value: stats?.schedules, icon: FileText },
    // { label: "Charts", value: stats?.schedules, icon: CalendarDays },

  ];

  return (
    <div className=" space-y-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {!stats
          ? cards.map((_, i) => (
              <Card key={i} className="border shadow-sm">
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-20" />
                </CardContent>
              </Card>
            ))
          : cards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm text-slate-600">
                        {item.label}
                      </CardTitle>
                      <Icon className="w-5 h-5 text-slate-500" />
                    </CardHeader>

                    <CardContent>
                      <p className="text-3xl font-bold">{item.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}
