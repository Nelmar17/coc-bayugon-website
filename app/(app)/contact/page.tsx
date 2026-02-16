"use client";

import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CurveWave from "@/components/ui/CurveWave";
import { motion, type Variants } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

// const fadeUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.6, ease: "easeOut" },
//   },
// };

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: { duration: 0.6 },
//   },
// };

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // ✅ cubic-bezier (easeOut feel)
    },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};



const MAP_EMBED =
  "https://www.google.com/maps?q=10.031784,119.161316&t=k&z=18&output=embed";

const MAP_LINK =
  "https://www.google.com/maps?q=10.031784,119.161316";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!captchaToken) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, captchaToken }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to send message");
      } else {
        toast.success("Message sent successfully!");
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setCaptchaToken(null);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-16 bg-white dark:bg-slate-950 ">
      {/* ================= HERO HEADER ================= */}
            <motion.section
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                className="relative h-[40vh] min-h-[300px] overflow-hidden"
              >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
                style={{
                  backgroundImage: "url('/church-contact.jpg')",
                }}
              />

            <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 flex items-center justify-center h-full text-center pt-12 px-4">
                <div>
                  
                  <motion.h1
                      variants={fadeUp}           
                      className="text-4xl md:text-5xl font-bold text-white"
                    >
                      Let’s Connect
                    </motion.h1>

                    <motion.p
                      variants={fadeUp}
                      transition={{ delay: 0.2 }}
                      className="text-slate-200 text-lg pt-2"
                    >
                      We'd love to hear from you.
                    </motion.p>
                </div>
              </div>
                <div className="absolute bottom-0 left-0 w-full pointer-events-none">
                  <CurveWave />
                </div>                 
            </motion.section>
            

      {/* ================= CONTENT ================= */}
      <div className="max-w-5xl mx-auto px-4 pb-28 space-y-12">

          {/* <h1 className="text-4xl font-bold text-center">
            Contact Us
          </h1> */}
        {/* CONTACT FORM */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
        <Card className="rounded-xl border backdrop-blur bg-white/80 dark:bg-slate-900/60 shadow-lg p-4">

          <CardHeader className="space-y-6">
            <p className="text-lg font-bold tracking-widest text-sky-700 dark:text-sky-400 uppercase">
              We’re Here to Listen
            </p>
            <CardTitle className="text-3xl text-slate-950 dark:text-slate-200 md:text-4xl font-bold">
              How Can We Pray for You?
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 pb-12">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">First Name</Label>
                  <Input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">Last Name</Label>
                  <Input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">Phone Number</Label>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <Label className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">Subject</Label>
                <Input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200">Message</Label>
                <Textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>

              <div className="w-full overflow-x-auto">
                <div className="scale-[0.85] origin-left sm:scale-100">
                  <ReCAPTCHA
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                      onChange={(token) => setCaptchaToken(token)}
                      onErrored={() => setCaptchaToken(null)}
                      onExpired={() => setCaptchaToken(null)}
                    />
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-52">
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="
                        w-full
                        h-11
                        px-6
                        rounded-full
                        text-base
                        font-medium
                        bg-blue-700
                        hover:bg-blue-600
                        dark:bg-blue-600
                        hover:dark:bg-blue-500
                        dark:text-white
                        shadow-xl shadow-blue-400/60 dark:shadow-blue-900/40
                        transition-all duration-300
                        hover:shadow-2xl
                        hover:-translate-y-0.5
                        active:scale-95
                      "
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
        {/* GOOGLE MAP */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
        <Card className="rounded-xl border backdrop-blur bg-white/80 dark:bg-slate-900/60 shadow-lg p-2">
          <CardHeader>
            <CardTitle>Our Location</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pb-14">
          <div className="relative rounded-lg overflow-hidden border group">
            <iframe
              src={MAP_EMBED}
                className="
                  w-full
                  h-[280px]
                  sm:h-[300px]
                  md:h-[420px]
                  lg:h-[480px]
                "
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Hover Label - TOP RIGHT */}
            <div className="pointer-events-none absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
              <div className="bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-lg shadow text-sm">
                📍 <strong>Bayugon Church of Christ</strong>
              </div>
            </div>

            <a
              href={MAP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="Open in Google Maps"
            />
          </div>

          <div className="rounded-lg border p-4 bg-slate-50 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Bayugon Church of Christ
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Sitio Bayugon, Brgy. Tinitian<br />
              Roxas, Palawan
            </p>
          </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`${MAP_LINK}&dirflg=d`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-center rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                🗺️ Get Directions
              </a>

              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-center rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                📍 Open in Google Maps
              </a>
            </div>
          </CardContent>
        </Card>
       </motion.div>
      </div>
    </div>
  );
}
