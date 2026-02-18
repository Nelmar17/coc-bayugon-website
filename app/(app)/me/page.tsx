"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AttendanceChart from "./AttendanceChart";
import CurveWave from "@/components/ui/CurveWave";

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */
type Stats = {
  total: number;
  present: number;
  absent: number;
  rate: number;
};

/* ---------------------------------------------
 * Page
 * -------------------------------------------- */
export default function MemberDashboardPage() {
  const [member, setMember] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch("/api/public/me", { credentials: "include" }),
          fetch("/api/public/me/stats", { credentials: "include" }),
        ]);

        if (!mRes.ok) {
          setMember(null);
          return;
        }

        const m = await mRes.json();
        const s = await sRes.json();

        setMember(m);
        setStats(s);
      } catch (err) {
        console.error("Dashboard load failed:", err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ---------------------------------------------
   * States
   * -------------------------------------------- */
  // if (loading) {
  //   return (
  //     <p className="text-center pt-28 text-slate-500">
  //       Loading dashboard...
  //     </p>
  //   );
  // }

  // if (!member) {
  //   return (
  //     <p className="text-center pt-36 text-slate-500">
  //        It looks like you’re not a member yet. Please reach out to the Bayugon Church Admin so they can add you to the members list.
  //     </p>

  //   );
  // }

  /* ---------------------------------------------
   * Render
   * -------------------------------------------- */
  return (
    <div className="space-y-6 bg-white dark:bg-slate-950">
      {/* ================= HERO ================= */}
      <section className="relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-20 sm:pt-16">
          <div className="max-w-xl sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Attendance
            </h1>

            {loading ? (
              /* ===== LOADING ===== */
              <div className="mt-6 p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                <p className="text-white text-lg font-medium animate-pulse">
                  Loading dashboard…
                </p>
              </div>
            ) : !member ? (
              /* ===== EMPTY ===== */
              <div className="mt-6 p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
                <h3 className="text-xl font-semibold text-white">
                  You are not yet registered as a member
                </h3>
                <p className="mt-2 text-sm text-slate-200">
                  Please reach out to the Bayugon Church Admin so they can add you to the members list.
                </p>
              </div>
            ) : (
              /* ===== MEMBER HERO TEXT ===== */
              <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
                <span className="block italic">
                  “Not forsaking the assembling of ourselves together…”
                </span>
                <span className="block not-italic mt-1 font-semibold">
                  Hebrews 10:25 (KJV)
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      {/* ================= MEMBER BODY ================= */}
      {!loading && member && (
        <div className="space-y-6 max-w-5xl mx-auto p-4 pb-28">
          <div>
            <h1 className="text-2xl font-bold">
              {member.firstName} — Attendance Overview
            </h1>
            <p className="text-sm text-slate-500">
              {member.congregation ?? "—"} Congregation
            </p>
          </div>

          {member.dateOfBaptism && (
            <BaptismBadge date={new Date(member.dateOfBaptism).toISOString()} />
          )}

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat title="Total" value={stats.total} />
              <Stat title="Present" value={stats.present} />
              <Stat title="Absent" value={stats.absent} />
              <Stat title="Attendance %" value={`${stats.rate}%`} />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

        /* ---------------------------------------------
        * Small Components
        * -------------------------------------------- */

        function Stat({ title, value }: { title: string; value: any }) {
          return (
            <Card className="bg-white dark:bg-slate-950">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                {value}
              </CardContent>
            </Card>
          );
        }

        /* ---------------------------------------------
        * Baptism Badge (Accurate)
        * -------------------------------------------- */

        function BaptismBadge({ date }: { date: string }) {
          const d = new Date(date);
          const years = calculateYears(d);

          return (
            <div
              className="
                inline-flex items-center gap-2
                px-3 py-1 rounded-full
                bg-blue-600/90 text-white
                text-sm font-medium shadow
              "
            >
              {years > 0 ? (
                <>🎉 Baptized {years} year{years !== 1 ? "s" : ""}</>
              ) : (
                <>🎉 Newly Baptized</>
              )}

              <span className="opacity-80">
                (since {format(d, "MMM d, yyyy")})
              </span>
            </div>
          );
        }

        /* ---------------------------------------------
        * Helpers
        * -------------------------------------------- */

        function calculateYears(date: Date) {
          const now = new Date();
          let years = now.getFullYear() - date.getFullYear();

          const hasHadAnniversary =
            now.getMonth() > date.getMonth() ||
            (now.getMonth() === date.getMonth() &&
              now.getDate() >= date.getDate());

          if (!hasHadAnniversary) years--;

          return Math.max(0, years);
        }
