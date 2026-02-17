"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import HistoryHero from "@/components/history/HistoryHero";
// import CurveWave from "@/components/ui/CurveWave";
import { ChevronLeft, ChevronRight } from "lucide-react";


/* ================= DATA ================= */

const timeline = [
  {
    year: "1990s",
    title: "The Beginning of the Bayugon Church of Christ",
      images: [
      "/history/h1-1-v2.jpg",
      "/history/h1-2.jpg",
      "/history/h1-3.jpg",
      "/history/h1-4.jpg",
      "/history/h1-5.jpg",
    ],
    content: [
      `The Bayugon Church of Christ was started in the 1990s through the preaching of brother <strong>Restituto J. Sanchez Sr.</strong> together with his wife <strong>Eufronia A. Sanchez</strong>. They are from Cebu City and arrived in Palawan in 1983.`,
      `Brother <strong>Restituto</strong> spent his ministry in Puerto Princesa City and helped plant several local churches. In 1990, he decided to move to Northern Palawan, particularly in Brgy. Jolo, after having contact with <strong>Joaquin Lagrosa</strong>, a former Baptist pastor.`,
      `Brother <strong>Lagrosa</strong> had already been working in the area, baptizing several people. Brother <strong>Restituto</strong> worked with him so that the Lord’s work might grow further.`,
    ],
  },
  {
    year: "Early 1990s",
    title: "Establishment in Sitio Bayugon",
     images: [
      "/history/h2-1.jpg",
      "/history/h2-2.jpg",
      "/history/h2-3.jpg",
      "/history/h2-4.jpg",
      "/history/h2-5.jpg",
    ],
    content: [
      `Some of the people baptized by brother <strong>Joaquin Lagrosa</strong> were from Sitio Bayugon, Barangay Tinitian. When brother <strong>Restituto Sanchez</strong> heard this, he moved his family to this small village to continue his ministry.`,
      `There he found <strong>Ramon Tindog</strong> and his wife <strong>Rosita Tindog</strong>, <strong>Bonifacio Buncag Sr.</strong> and his wife <strong>Aurora Buncag</strong>, and <strong>Enet Gadi</strong>. They joyfully welcomed him, having long hoped for someone to preach to them.`,
      `From then on, they gathered every Sunday for worship services. Brother <strong>Restituto</strong> and his wife preached from house to house, and many people obeyed the gospel and were baptized into Christ.`,
      `Those baptized included <strong>Nilo Buncag</strong>, <strong>Yoli Buncag</strong>, <strong>Mely Buncag</strong>, <strong>Bonifacio Buncag</strong>, <strong>Joan Carnay</strong>, <strong>Segundina Carnay</strong>, <strong>Jiter Buncag</strong>, <strong>Editha Barone</strong>, <strong>Maria Lourdes Solina</strong>, <strong>Merlie Castromayor</strong>, <strong>Juvelyn Carnay</strong>, <strong>Mary Jane Sanchez</strong>, <strong>Jorge Maraver</strong>, and <strong>Erma Buncag</strong>.`,
    ],
  },
  {
    year: "1996–2007",
    title: "Continuation of the Ministry under Mitozyl Sanchez",
     images: [
      "/history/h3-1.jpg",
      "/history/h3-2.jpg",
      "/history/h3-3.jpg",
      "/history/h3-4.jpg",
      "/history/h3-5.jpg",
    ],
    content: [
      `After the passing of brother <strong>Joaquin Lagrosa</strong>, brother <strong>Restituto Sanchez Sr.</strong> handled both the Jolo and Bayugon congregations.`,
      `When brother <strong>Restituto Sanchez Sr.</strong> passed away on May 6, 1996, his son <strong>Mitozyl Sanchez</strong> continued the preaching ministry.`,
      `Those added during this period included <strong>Yolanda Aga</strong>, <strong>Boy Tindog</strong>, <strong>Noli Buncag</strong>, <strong>Garma Bentuco</strong>, <strong>Nelson Solina</strong> and his wife <strong>Merlinda Solina</strong>, <strong>Valeriana Bentuco</strong>, <strong>Raymond Quibec</strong>, <strong>Yolmar Buncag</strong>, <strong>Mary Joy Buncag</strong>, <strong>Roy Castromayor</strong>, <strong>Vincent Castromayor</strong>, and <strong>Jeffrey Tindog</strong>.`,
      `Others were baptized through gospel meetings, including <strong>Ernesto Bentuco</strong>, <strong>Florencio Castromayor</strong>, <strong>Nizhy Castromayor</strong>, <strong>Anecito Dela Cerna</strong> and his wife <strong>Mylene Dela Cerna</strong>, <strong>Jojo Dela Cerna</strong> and his wife <strong>Rosalie Dela Cerna</strong>, <strong>Nelmar Buncag</strong>, and <strong>Marly Sanchez</strong>.`,
    ],
  },
  {
    year: "2007–2018",
    title: "Leadership of Brother Yoli Buncag",
     images: [
      "/history/h4-1.jpg",
      "/history/h4-2.jpg",
      "/history/h4-3.jpg",
      "/history/h4-4.jpg",
    ],
    content: [
      `When brother <strong>Mitozyl Sanchez</strong> moved to Roxas in 2007, brother <strong>Yoli Buncag</strong> took responsibility for the Bayugon Church.`,
      `During his preaching ministry, several people were added to the church, including <strong>Macmac Aga</strong>, <strong>Jemima Solina</strong>, <strong>Nicole Solina</strong>, <strong>Raymark Dela Cerna</strong>, <strong>John Henry Solina</strong>, <strong>Vince Solina</strong>, <strong>Marvin Sanchez</strong>, <strong>Ernesto Aga</strong>, <strong>Cristina Pia Aga</strong>, <strong>Joan Solina</strong>, <strong>Mary Grace Aga</strong>, <strong>Bernabe Aga</strong>, <strong>Franklyn Dela Cerna</strong>, and <strong>Jenjen Buncag</strong>.`,
    ],
  },
  {
    year: "2018–2025",
    title: "Growth of the Work in Sitio Bayugon",
     images: [
      "/history/h5-1.jpg",
      "/history/h5-2.jpg",
      "/history/h5-3.jpg",
      "/history/h5-4.jpg",
    ],
    content: [
      `In 2018, brother <strong>Mitozyl Sanchez</strong> returned to Sitio Bayugon and worked together with brother <strong>Yoli Buncag</strong> to preserve and grow the Lord’s work.`,
      `Those added during this time included <strong>Vergilia Buncag</strong>, <strong>Christine Tolentino</strong>, <strong>Lemuel Ganancial</strong>, <strong>Merly Aga</strong>, <strong>Diana Aga</strong>, <strong>Zyrus Sanchez</strong>, <strong>Neil Ivan Tolentino</strong>, <strong>April Jane Tolentino</strong>, <strong>Nicole Orleans</strong>, <strong>Rica Mae Orleans</strong>, <strong>Yolin Mae Buncag</strong>, <strong>Aibon Buncag</strong>, <strong>Jr. Tindog</strong>, <strong>Reziel Gabayan</strong>, <strong>Mary Ann Pellina</strong>, <strong>Raymond Tolentino</strong>, <strong>Rea Buncag</strong>, <strong>Rebecca Villano</strong>, <strong>Apple Jean T. Solina</strong>, and <strong>Aivan Ray Quibec</strong>.`,
    ],
  },

 {
    year: "2025–Present",
    title: "Joint Ministry and Present Leadership",
     images: [
      "/history/h6-1.jpg",
      "/history/h6-2.jpg",
      "/history/h6-3.jpg",
      "/history/h6-4.jpg",
    ],
    content: [
      `In September 2025, brother <strong>Vence B. Solina</strong> was officially installed as the preacher of the Bayugon Church, together with <strong>Mitozyl A. Sanchez</strong> and <strong>Yoli S. Buncag</strong>. We continue to pray that
            through their leadership and the unity of the members, the church
            will remain strong until the coming of our Lord Jesus Christ
            (Ephesians 4:16).`,
    ],
  },

];

/* ================= PAGE ================= */

export default function ChurchHistoryPage() {
  // const [lightbox, setLightbox] = useState<string | null>(null);

  const [lightbox, setLightbox] = useState<{
  images: string[];
  index: number;
} | null>(null);

  const [direction, setDirection] = useState<Record<number, number>>({});

  const [activeImage, setActiveImage] = useState<Record<number, number>>({});
  const [paused, setPaused] = useState<Record<number, boolean>>({});

  const getIndex = (i: number) => activeImage[i] ?? 0;



const [touchStart, setTouchStart] = useState<number | null>(null);

const onTouchStart = (e: React.TouchEvent) =>
  setTouchStart(e.touches[0].clientX);

const onTouchEnd = (e: React.TouchEvent) => {
  if (touchStart === null) return;
  const diff = touchStart - e.changedTouches[0].clientX;
  if (diff > 50) nextLightbox();
  if (diff < -50) prevLightbox();
  setTouchStart(null);
};

const nextImage = (i: number, total: number) => {
  setDirection((d) => ({ ...d, [i]: 1 }));
  setActiveImage((s) => ({
    ...s,
    [i]: (getIndex(i) + 1) % total,
  }));
};

const prevImage = (i: number, total: number) => {
  setDirection((d) => ({ ...d, [i]: -1 }));
  setActiveImage((s) => ({
    ...s,
    [i]: (getIndex(i) - 1 + total) % total,
  }));
};


  const nextLightbox = () => {
  if (!lightbox) return;
  setLightbox({
    ...lightbox,
    index: (lightbox.index + 1) % lightbox.images.length,
  });
};

const prevLightbox = () => {
  if (!lightbox) return;
  setLightbox({
    ...lightbox,
    index:
      (lightbox.index - 1 + lightbox.images.length) %
      lightbox.images.length,
  });
};


useEffect(() => {
  if (!lightbox) return;

  const timer = setInterval(() => {
    nextLightbox();
  }, 4000);

  return () => clearInterval(timer);
}, [lightbox]);


useEffect(() => {
  const timers = timeline.map((item, i) => {
    if (item.images.length <= 1) return null;

    return setInterval(() => {
      if (paused[i]) return;

      setDirection((d) => ({ ...d, [i]: 1 })); 
      setActiveImage((s) => ({
        ...s,
        [i]: ((s[i] ?? 0) + 1) % item.images.length,
      }));
    }, 4000);
  });

  return () => {
    timers.forEach((t) => t && clearInterval(t));
  };
}, [paused]);


useEffect(() => {
  if (!lightbox) return;

  const handler = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") nextLightbox();
    if (e.key === "ArrowLeft") prevLightbox();
    if (e.key === "Escape") setLightbox(null);
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [lightbox]);



  return (
    <div className="bg-white dark:bg-slate-950">
      {/* ================= HEADER (NAVBAR BACKGROUND) ================= */}
      <section className="relative h-[86vh] min-h-[380px] overflow-hidden">
        
        <HistoryHero />

             {/* <div className="absolute bottom-0 left-0 w-full pointer-events-none">
                  <CurveWave />
              </div> */}
      </section>

      {/* ================= INTRO ================= */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-4xl font-bold">
          History of Bayugon Church of Christ
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          A faithful journey of gospel preaching, dedication, and God’s
          continuing work through the years.
        </p>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative">
          {/* vertical line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2" />

          {timeline.map((item, i) => {
            const left = i % 2 === 0;

            return (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative grid md:grid-cols-2 gap-10 items-start pb-24"
              >
                {/* YEAR BADGE */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
                  <span className="px-4 py-1 rounded-full bg-blue-700 text-white text-sm font-semibold shadow">
                    {item.year}
                  </span>
                </div>

                {/* TEXT */}
                <div className={left ? "md:pr-12" : "md:col-start-2 md:pl-12"}>
                  <div className="bg-white dark:bg-slate-950 rounded-xl border border-blue-400 shadow-xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                 {item.content.map((p, idx) => (
                    <p
                      key={idx}
                      className="text-md leading-relaxed text-slate-800 dark:text-slate-400"
                      dangerouslySetInnerHTML={{ __html: p }}
                    />
                  ))}
                  </div>
                </div>
             {/* IMAGE CAROUSEL */}                               
                <div
                  className={
                    left ? "md:col-start-2 md:pl-12" : "md:pr-12 md:row-start-1"
                  }
                >
                  <div
                    className="relative"
                    onMouseEnter={() => setPaused((p) => ({ ...p, [i]: true }))}
                    onMouseLeave={() => setPaused((p) => ({ ...p, [i]: false }))}
                  >
                    {/* IMAGE STAGE (fixed height = no layout jump) */}
                    <div
                      className="relative group overflow-hidden rounded-xl shadow-lg w-full h-[320px] sm:h-[380px]"
                      onClick={() =>
                        setLightbox({ images: item.images, index: getIndex(i) })
                      }
                      role="button"
                      tabIndex={0}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                          key={item.images[getIndex(i)]}
                          className="absolute inset-0"
                          initial={{ x: `${(direction[i] ?? 1) * 100}%` }}
                          animate={{ x: "0%" }}
                          exit={{ x: `${(direction[i] ?? 1) * -100}%` }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                        >
                          <Image
                            src={item.images[getIndex(i)]}
                            alt={item.title}
                            fill
                            className="object-cover cursor-zoom-in"
                            sizes="(max-width: 768px) 100vw, 600px"
                            priority={i === 0}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* PREV */}
                      {item.images.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(i, item.images.length);
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"

                        >
                          <ChevronLeft size={16} />
                        </button>
                      )}

                      {/* NEXT */}
                      {item.images.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(i, item.images.length);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>

                    {/* DOTS */}
                    <div className="flex justify-center gap-2 mt-3">
                      {item.images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDirection((d) => ({ ...d, [i]: idx > getIndex(i) ? 1 : -1 }));
                            setActiveImage((s) => ({ ...s, [i]: idx }));
                          }}
                          className={`w-2 h-2 rounded-full ${
                            getIndex(i) === idx ? "bg-blue-600" : "bg-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================= LIGHTBOX ================= */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
              onClick={() => setLightbox(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                className="relative"
              >
                <img
                  src={lightbox.images[lightbox.index]}
                  className="max-h-[90vh] max-w-full rounded-lg"
                />

                {/* PREV */}
                <button
                  onClick={prevLightbox}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft />
                </button>

                {/* NEXT */}
                <button
                  onClick={nextLightbox}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  <ChevronRight />
                </button>

                {/* COUNTER */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {lightbox.index + 1} / {lightbox.images.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </div>
  );
}
