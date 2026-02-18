"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import WhatToExpect from "@/components/WhatToExpect";
import CurveWave from "@/components/ui/CurveWave";

import {
  Music,
  HandHeart,
  BookOpen,
  Wine,
  Wallet,
} from "lucide-react";

  // Handshake,
  // HandHelping,
  // MailCheck,

/* =========================
   DATA
   ========================= */

const worshipItems = [
  {
    no: "01",
    title: "Singing Praise to God",
    icon: Music,
    text: `Our worship includes congregational singing as a way of praising God and teaching one another.
            Rather than using instrumental music, we sing with our voices, seeking to offer heartfelt praise that comes from within.

            Our goal is not musical performance, but worship that reflects gratitude, reverence, and devotion to God.`,
                verseRef: "Colossians 3:16 (KJV)",
                verseText: `Let the word of Christ dwell in you richly in all wisdom;
                            teaching and admonishing one another in psalms and hymns and spiritual songs,
                            singing with grace in your hearts to the Lord.`,
  },
  {
    no: "02",
    title: "Prayer",
    icon: HandHeart,
    text: `Prayer plays a central role in our worship. Through prayer, we express thanksgiving,
            seek guidance, and lift up the needs of others.

            Prayer reminds us that worship is not only outward action, but a humble conversation with God.`,
                verseRef: "1 Timothy 2:1–2 (KJV)",
                verseText: `I exhort therefore, that, first of all, supplications, prayers, intercessions,
                            and giving of thanks, be made for all men;

                            For kings, and for all that are in authority; that we may lead a quiet and peaceable life
                            in all godliness and honesty.`,
  },
  {
    no: "03",
    title: "Preaching the Word",
    icon: BookOpen,
    text: `The teaching of God’s Word is an essential part of our worship.
            Scripture is explained and applied to encourage growth in understanding and faith.

            Preaching reflects the practice of the early church, where disciples gathered to hear the Word taught.`,
                verseRef: "Acts 20:7 (KJV)",
                verseText: `And upon the first day of the week, when the disciples came together to break bread,
                            Paul preached unto them, ready to depart on the morrow; and continued his speech until midnight.`,
  },
  {
    no: "04",
    title: "The Lord’s Supper",
    icon: Wine,
    text: `Each Sunday, we observe the Lord’s Supper in remembrance of Jesus Christ.
            We reflect on His sacrifice—His body given and His blood shed—for the forgiveness of sins.

            This memorial helps us focus on Christ’s love, suffering, and the hope found in Him.`,
                verseRef: "1 Corinthians 11:23–25 (KJV)",
                verseText: `For I have received of the Lord that which also I delivered unto you,
                            That the Lord Jesus the same night in which he was betrayed took bread:

                            And when he had given thanks, he brake it, and said, Take, eat:
                            this is my body, which is broken for you: this do in remembrance of me.`,
  },
  {
    no: "05",
    title: "Giving",
    icon: Wallet,
    text: `Giving is included in our worship as an act of gratitude and responsibility.
            Rather than giving by compulsion or a fixed percentage, members are encouraged to give willingly
            and thoughtfully, according to their ability.

            The funds collected are used to support the work God has entrusted to the church.
            This includes spreading the gospel (evangelism), strengthening believers (edification),
            and helping those in need (benevolence).`,
                verseRef: "1 Corinthians 16:1–2 (KJV)",
                verseText: `Now concerning the collection for the saints,
                            as I have given order to the churches of Galatia, even so do ye.

                            Upon the first day of the week let every one of you lay by him in store,
                            as God hath prospered him, that there be no gatherings when I come.`,
  },
];

    export const containerVariants: Variants = {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
        },
      },
    };

    export const itemVariants: Variants = {
      hidden: {
        opacity: 0,
        y: 20,
      },
      show: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut", 
        },
      },
    };

/* =========================
   PAGE
   ========================= */

export default function HowWeWorshipPage() {
  return (
    <div className="min-h-screen space-y-20 bg-white dark:bg-slate-950">
      {/* HEADER */}
      <section className="relative h-[30vh] min-h-[360px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              How We Worship
            </h1>
            <p className="mt-4 text-slate-200 text-lg">
              Worship that is simple, reverent, and guided by Scripture.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>
      {/* ================= INTRO ================= */}
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto px-4 space-y-6 text-center"
            >

        <h2 className="text-2xl md:text-3xl font-bold">
            A Scriptural Approach to Worship
        </h2>

        <p className="text-lg text-slate-600 dark:text-slate-400">
            Each first day of the week, the congregation comes together to honor
            God through worship that is rooted in Scripture and focused on the heart.
            Our aim is not to follow modern trends, but to worship in a manner
            consistent with the example taught by Christ and practiced by the early church.
        </p>

        <p className="italic text-lg text-slate-600 dark:text-slate-200">
            “God is a Spirit: and they that worship him must worship him in spirit and in truth.”
            <span className="block not-italic mt-1">— John 4:23–24 (KJV) </span>
        </p>
        </motion.section>

        {/* CONTENT */}
        <motion.section
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-7xl mx-auto px-4 space-y-24"
                >

        {worshipItems.map((item, index) => {
            const Icon = item.icon;

            return (
                <motion.div
                    key={item.no}
                    variants={itemVariants}
                    className="space-y-24"
                    >
                {/* ROW */}
                <div className="grid md:grid-cols-2 gap-20 items-start">
                
                {/* LEFT */}
                <div className="space-y-6">
                    <div className="flex rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none border py-1 px-2 border-blue-300 dark:border-blue-900 items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                            {item.no}
                        </span>
                        <Icon className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl md:text-2xl font-bold">{item.title}</h2>
                    </div>
                    <p className="text-lg text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {item.text}
                    </p>
                </div>

                {/* RIGHT */}
                    {/* <Card className="rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none p-6 shadow-xl">

                    <p className="italic py-8 text-lg text-slate-700 text-center dark:text-slate-300 whitespace-pre-line">
                        {item.verseText}
                    </p>

                    <p className="mt-3 text-lg pb-8 text-center font-semibold text-slate-900 dark:text-slate-100">
                        {item.verseRef}
                    </p>
                    </Card> */}

                  <Card className="rounded-2xl p-10 shadow-lg text-center border border-blue-400/20 bg-white dark:bg-slate-950/60 space-y-6">
                        {/* ICON */}
                        <div className="mx-auto w-fit rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>

                        {/* VERSE TEXT */}
                        <p className="italic text-lg text-slate-700 dark:text-slate-300 whitespace-pre-line">
                            {item.verseText}
                        </p>

                        {/* REFERENCE */}
                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {item.verseRef}
                        </p>
                  </Card>
                </div>

                {/* ONE FULL-WIDTH SEPARATOR */}
                {index < worshipItems.length - 1 && (
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                )}
            </motion.div>
            );
        })}
    </motion.section>

  <hr className="max-w-7xl mx-auto my-12 border-slate-200 dark:border-slate-800" />

   {/* ================= CLOSING ================= */}
      <section className="max-w-6xl mx-auto px-4 pb-4 sm:pb-8 text-center space-y-6">
        <h2 className="text-2xl font-bold">
          A Simple Approach to Worship
        </h2>

        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Our desire is to worship God in spirit and in truth—without adding
          human traditions or removing what Scripture teaches. Everything we
          practice in worship is guided by the Word of God, with the aim of
          honoring Him and building one another up.
        </p>

        <p className="italic text-lg text-slate-600 dark:text-slate-200">
          “God is a Spirit: and they that worship him must worship him in spirit and in truth.”
          <span className="block not-italic mt-1">
            — John 4:23–24 (KJV)
          </span>
        </p>
      </section>


      {/* ================= WHAT TO EXPECT ================= */}

       <WhatToExpect />
      {/* <section className="bg-slate-100 dark:bg-slate-900/40 py-20 pb-28">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <header className="text-center space-y-3">
            <h2 className="text-3xl font-bold">
              What to Expect When You Visit
            </h2>
            <p className="text-md text-slate-600 dark:text-slate-400">
              If you are visiting for the first time, here’s what you can expect.
            </p>
          </header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
            >
          <motion.div variants={itemVariants}>
            <ExpectCard
              icon={Handshake}
              title="A Warm Welcome"
              text="You will be greeted warmly, but never pressured. Visitors are welcome to observe and participate as they feel comfortable."
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ExpectCard
              icon={HandHelping}
              title="Simple & Orderly Worship"
              text="Our services are reverent, focused, and centered on Scripture rather than entertainment."
            />
            </motion.div>
            <motion.div variants={itemVariants}>
            <ExpectCard
              icon={MailCheck}
              title="Open Invitation"
              text="No special attire is required. Come as you are, with an open heart and a desire to learn."
            />
            </motion.div>
          </motion.div>
        </div>
      </section> */}
    </div>
  );
}

/* =========================
   EXPECT CARD
   ========================= */

// function ExpectCard({
//   icon: Icon,
//   title,
//   text,
// }: {
//   icon: React.ElementType;
//   title: string;
//   text: string;
// }) {
//   return (
//       <motion.div variants={itemVariants}>
//         <Card className="rounded-2xl border bg-background p-6 text-center space-y-4">
//             <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-fit">
//                 <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//             </div>

//             <h3 className="font-semibold text-lg md:text-xl">
//                 {title}
//             </h3>

//             <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
//                 {text}
//             </p>
//         </Card>
//       </motion.div>
//   );
// }


// "use client";

// import { useState } from "react";
// import CurveWave from "@/components/ui/CurveWave";
// import { Card } from "@/components/ui/card";
// import {
//   Music,
//   HandHeart,
//   BookOpen,
//   Wine,
//   Wallet,
//   HandHelping,
//   Handshake,
//   MailCheck,
// } from "lucide-react";

// /* =========================
//    DATA
//    ========================= */

// const worshipItems = [
//   {
//     no: "01",
//     title: "Singing Praise to God",
//     icon: Music,
//     text: `Our worship includes congregational singing as a way of praising God and teaching one another.
// Rather than using instrumental music, we sing with our voices, seeking to offer heartfelt praise that comes from within.

// Our goal is not musical performance, but worship that reflects gratitude, reverence, and devotion to God.`,
//     scripture: {
//       reference: "Colossians 3:16",
//       text: `Let the word of Christ dwell in you richly in all wisdom;
// teaching and admonishing one another in psalms and hymns and spiritual songs,
// singing with grace in your hearts to the Lord.`,
//     },
//   },
//   {
//     no: "02",
//     title: "Prayer",
//     icon: HandHeart,
//     text: `Prayer plays a central role in our worship. Through prayer, we express thanksgiving,
// seek guidance, and lift up the needs of others.

// Prayer reminds us that worship is not only outward action, but a humble conversation with God.`,
//     scripture: {
//       reference: "1 Timothy 2:1–2",
//       text: `I exhort therefore, that, first of all, supplications, prayers, intercessions,
// and giving of thanks, be made for all men;

// For kings, and for all that are in authority; that we may lead a quiet and peaceable life
// in all godliness and honesty.`,
//     },
//   },
//   {
//     no: "03",
//     title: "Teaching and Preaching the Word",
//     icon: BookOpen,
//     text: `The teaching of God’s Word is an essential part of our worship.
// Scripture is explained and applied to encourage growth in understanding and faith.

// Preaching reflects the practice of the early church, where disciples gathered to hear the Word taught.`,
//     scripture: {
//       reference: "Acts 20:7",
//       text: `And upon the first day of the week, when the disciples came together to break bread,
// Paul preached unto them, ready to depart on the morrow;
// and continued his speech until midnight.`,
//     },
//   },
//   {
//     no: "04",
//     title: "The Lord’s Supper",
//     icon: Wine,
//     text: `Each Sunday, we observe the Lord’s Supper in remembrance of Jesus Christ.
// We reflect on His sacrifice—His body given and His blood shed—for the forgiveness of sins.

// This memorial helps us focus on Christ’s love, suffering, and the hope found in Him.`,
//     scripture: {
//       reference: "1 Corinthians 11:23–24",
//       text: `For I have received of the Lord that which also I delivered unto you,
// That the Lord Jesus the same night in which he was betrayed took bread:

// And when he had given thanks, he brake it, and said,
// Take, eat: this is my body, which is broken for you:
// this do in remembrance of me.`,
//     },
//   },
//   {
//     no: "05",
//     title: "Giving",
//     icon: Wallet,
//     text: `Giving is included in our worship as an act of gratitude and responsibility.
// Rather than giving by compulsion or a fixed percentage, members are encouraged to give willingly
// and thoughtfully, according to their ability.

// The funds collected are used to support the work God has entrusted to the church.
// This includes spreading the gospel (evangelism), strengthening believers (edification),
// and helping those in need (benevolence).`,
//     scripture: {
//       reference: "1 Corinthians 16:1–2",
//       text: `Now concerning the collection for the saints,
// as I have given order to the churches of Galatia, even so do ye.

// Upon the first day of the week let every one of you lay by him in store,
// as God hath prospered him, that there be no gatherings when I come.`,
//     },
//   },
// ];

// /* =========================
//    PAGE
//    ========================= */

// export default function HowWeWorshipPage() {
//   const [active, setActive] = useState(worshipItems[0]);

//   return (
//     <div className="bg-white dark:bg-slate-950 space-y-26">
//       {/* ================= HEADER ================= */}
//       <section className="relative h-[30vh] sm:h-[45vh] min-h-[360px] -mt-16 overflow-hidden">
//         <div
//           className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//           style={{ backgroundImage: "url('/church-contact.jpg')" }}
//         />
//         <div className="absolute inset-0 bg-black/60" />

//         <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-16">
//           <div className="max-w-2xl">
//             <h1 className="text-4xl md:text-5xl font-bold text-white">
//               How We Worship
//             </h1>
//             <p className="mt-4 text-slate-200 text-lg">
//               A simple, scriptural approach to honoring God together.
//             </p>
//           </div>
//         </div>

//         <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//           <CurveWave />
//         </div>
//       </section>

//       {/* ================= INTRO ================= */}
//       <section className="max-w-5xl mx-auto px-4 space-y-6 text-center">
//         <p className="text-lg text-slate-600 dark:text-slate-400">
//           Each first day of the week, the congregation comes together to honor God
//           through worship that is rooted in Scripture and focused on the heart.
//         </p>

//         <p className="italic text-slate-500 dark:text-slate-400">
//           “God is spirit, and those who worship Him must worship in spirit and in truth.”
//           <span className="block not-italic mt-1">(John 4:23–24)</span>
//         </p>
//       </section>

//       {/* ================= WORSHIP LAYOUT ================= */}
//       <section className="max-w-6xl mx-auto px-4 pb-24">
//         <div className="grid md:grid-cols-3 gap-10">
          
//           {/* LEFT LIST */}
//           <div className="space-y-3">
//             {worshipItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = active.no === item.no;

//               return (
//                 <button
//                   key={item.no}
//                   onClick={() => setActive(item)}
//                   className={`w-full text-left rounded-xl p-4 border transition
//                     ${
//                       isActive
//                         ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
//                         : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
//                     }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className="font-bold text-blue-600">
//                       {item.no}
//                     </span>
//                     <Icon className="w-4 h-4 text-blue-600" />
//                     <span className="font-semibold">
//                       {item.title}
//                     </span>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>

//           {/* RIGHT CONTENT */}
//           <div className="md:col-span-2 space-y-6">
//             <h2 className="text-2xl font-bold">{active.title}</h2>

//             <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
//               {active.text}
//             </p>

//             <blockquote className="border-l-4 border-blue-600 pl-4 italic text-slate-700 dark:text-slate-300">
//               <p className="whitespace-pre-line">
//                 {active.scripture.text}
//               </p>
//               <span className="block mt-2 text-sm not-italic text-slate-500">
//                 — {active.scripture.reference}
//               </span>
//             </blockquote>
//           </div>
//         </div>
//       </section>

//       {/* ================= WHAT TO EXPECT ================= */}
//       <section className="bg-slate-50 dark:bg-slate-900/40 py-20">
//         <div className="max-w-5xl mx-auto px-4 space-y-10">
//           <header className="text-center space-y-3">
//             <h2 className="text-3xl font-bold">
//               What to Expect When You Visit
//             </h2>
//             <p className="text-slate-600 dark:text-slate-400">
//               If you are visiting for the first time, here’s what you can expect.
//             </p>
//           </header>

//           <div className="grid md:grid-cols-3 gap-6">
//             <ExpectCard
//               icon={Handshake}
//               title="A Warm Welcome"
//               text="You will be greeted warmly, but never pressured. Visitors are welcome to observe and participate as they feel comfortable."
//             />
//             <ExpectCard
//               icon={HandHelping}
//               title="Simple & Orderly Worship"
//               text="Our services are reverent, focused, and centered on Scripture rather than entertainment."
//             />
//             <ExpectCard
//               icon={MailCheck}
//               title="Open Invitation"
//               text="No special attire is required. Come as you are, with an open heart and a desire to learn."
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// /* =========================
//    EXPECT CARD
//    ========================= */

// function ExpectCard({
//   icon: Icon,
//   title,
//   text,
// }: {
//   icon: React.ElementType;
//   title: string;
//   text: string;
// }) {
//   return (
//     <Card className="rounded-2xl border bg-background p-6 text-center space-y-4">
//       <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-fit">
//         <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//       </div>
//       <h3 className="font-semibold text-lg">{title}</h3>
//       <p className="text-slate-600 dark:text-slate-400 text-sm">
//         {text}
//       </p>
//     </Card>
//   );
// }







// "use client";
// import { useState } from "react";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import CurveWave from "@/components/ui/CurveWave";
// import {
//   Music,
//   HandHeart,
//   BookOpen,
//   Wine,
//   Wallet,
//   HandHelping,
//   Handshake,
//   MailCheck,
// } from "lucide-react";

// import { motion } from "framer-motion";



// const worshipItems = [
//   {
//     no: "01",
//     title: "Singing Praise to God",
//     icon: Music,
//     text: `Our worship includes congregational singing as a way of praising God and teaching one another.
// Rather than using instrumental music, we sing with our voices, seeking to offer heartfelt praise that comes from within.

// Our goal is not musical performance, but worship that reflects gratitude, reverence, and devotion to God.`,
//     verse: "Colossians 3:16; 1 Corinthians 14:15",
//   },
//   {
//     no: "02",
//     title: "Prayer",
//     icon: HandHeart,
//     text: `Prayer plays a central role in our worship. Through prayer, we express thanksgiving,
// seek guidance, and lift up the needs of others.

// Prayer reminds us that worship is not only outward action, but a humble conversation with God.`,
//     verse: "1 Timothy 2:1–2",
//   },
//   {
//     no: "03",
//     title: "Teaching and Preaching the Word",
//     icon: BookOpen,
//     text: `The teaching of God’s Word is an essential part of our worship.
// Scripture is explained and applied to encourage growth in understanding and faith.

// Preaching reflects the practice of the early church, where disciples gathered to hear the Word taught.`,
//     verse: "Acts 20:7; 1 Corinthians 1:21",
//   },
//   {
//     no: "04",
//     title: "The Lord’s Supper",
//     icon: Wine,
//     text: `Each Sunday, we observe the Lord’s Supper in remembrance of Jesus Christ.
// We reflect on His sacrifice—His body given and His blood shed—for the forgiveness of sins.

// This memorial helps us focus on Christ’s love, suffering, and the hope found in Him.`,
//     verse: "1 Corinthians 11:23–26",
//   },
//   {
//     no: "05",
//     title: "Giving",
//     icon: Wallet,
//     text: `Giving is included in our worship as an act of gratitude and responsibility. 
//     Rather than giving by compulsion or a fixed percentage, members are encouraged to give willingly and thoughtfully, according to their ability.

//     The funds collected are used to support the work God has entrusted to the church. This includes spreading the gospel (evangelism), 
//     strengthening and building up believers (edification), and helping those in need (benevolence). 
//     Through giving, members share in the work of teaching, caring, and serving as taught in the Scriptures.`,
//     verse: "1 Corinthians 16:1–2; 2 Corinthians 9:6–7",
//   },
// ];

// export default function HowWeWorshipPage() {
//   return (
//     <div className="bg-white dark:bg-slate-950 space-y-20">
//       {/* ================= HEADER ================= */}
//       <section className="relative h-[30vh] sm:h-[45vh] min-h-[360px] -mt-16 overflow-hidden">
//         <div
//           className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//           style={{ backgroundImage: "url('/church-contact.jpg')" }}
//         />
//         <div className="absolute inset-0 bg-black/60" />

//         <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-16">
//           <div className="max-w-2xl">
//             <h1 className="text-4xl md:text-5xl font-bold text-white">
//               How We Worship
//             </h1>
//             <p className="mt-4 text-slate-200 text-lg">
//               A simple, scriptural approach to honoring God together.
//             </p>
//           </div>
//         </div>

//         <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//           <CurveWave />
//         </div>
//       </section>

//       {/* ================= INTRO ================= */}
//       <section className="max-w-5xl mx-auto px-4 space-y-6 text-center">
//         <p className="text-lg text-slate-600 dark:text-slate-400">
//           Each first day of the week, the congregation comes together to honor
//           God through worship that is rooted in Scripture and focused on the heart.
//           Our aim is not to follow modern trends, but to worship in a manner
//           consistent with the example taught by Christ and practiced by the early church.
//         </p>

//         <p className="italic text-slate-500 dark:text-slate-400">
//           “God is spirit, and those who worship Him must worship in spirit and in truth.”
//           <span className="block not-italic mt-1">(John 4:23–24)</span>
//         </p>
//       </section>

//       {/* ================= WORSHIP CARDS ================= */}
//       <section className="max-w-6xl mx-auto px-4 pb-20">
//         <div className="grid md:grid-cols-2 gap-8">
//           {worshipItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <Card
//                 key={item.no}
//                 className="rounded-2xl border bg-background p-6 space-y-4"
//               >
//                 <CardHeader className="flex flex-row items-center gap-4 p-0">
//                   <div className="text-blue-600 dark:text-blue-400 font-bold text-xl">
//                     {item.no}
//                   </div>
//                   <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
//                     <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <CardTitle className="text-xl">{item.title}</CardTitle>
//                 </CardHeader>

//                 <CardContent className="p-0 space-y-3">
//                   <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
//                     {item.text}
//                   </p>
//                   <p className="text-sm italic text-slate-500">
//                     {item.verse}
//                   </p>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       </section>

//       {/* ================= WHAT TO EXPECT ================= */}
//       <section className="bg-slate-50 dark:bg-slate-900/40 py-20">
//         <div className="max-w-5xl mx-auto px-4 space-y-10">
//           <header className="text-center space-y-3">
//             <h2 className="text-3xl font-bold">What to Expect When You Visit</h2>
//             <p className="text-slate-600 dark:text-slate-400">
//               If you are visiting for the first time, here’s what you can expect.
//             </p>
//           </header>

//           <div className="grid md:grid-cols-3 gap-6">
//             <ExpectCard
//               icon={Handshake}
//               title="A Warm Welcome"
//               text="You will be greeted warmly, but never pressured. Visitors are welcome to observe and participate as they feel comfortable."
//             />
//             <ExpectCard
//               icon={HandHelping}
//               title="Simple & Orderly Worship"
//               text="Our services are reverent, focused, and centered on Scripture rather than entertainment."
//             />
//             <ExpectCard
//               icon={MailCheck}
//               title="Open Invitation"
//               text="No special attire is required. Come as you are, with an open heart and a desire to learn."
//             />
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// function ExpectCard({
//   icon: Icon,
//   title,
//   text,
// }: {
//   icon: React.ElementType;
//   title: string;
//   text: string;
// }) {
//   return (
//     <Card className="rounded-2xl border bg-background p-6 text-center space-y-4">
//       <div className="mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 w-fit">
//         <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
//       </div>
//       <h3 className="font-semibold text-lg">{title}</h3>
//       <p className="text-slate-600 dark:text-slate-400 text-sm">
//         {text}
//       </p>
//     </Card>
//   );
// }
