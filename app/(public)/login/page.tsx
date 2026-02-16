"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {ChevronsLeft, ChevronsRight} from "lucide-react";


export default function LoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [accepted, setAccepted] = useState(false);



useEffect(() => {
  const savedEmail = localStorage.getItem("login-email");
  if (savedEmail) setEmail(savedEmail);
}, []);


useEffect(() => {
  if (!error) return;

  if (!email) {
    emailRef.current?.focus();
  } else {
    passwordRef.current?.focus();
  }
}, [error]);



  // ✅ HOOK #1
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ HOOK #2
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [password]);

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // if (!res.ok) {
      //   setError(data?.message ?? "Invalid credentials");
      //   return;
      // }


      if (!res.ok) {
      localStorage.setItem("login-email", email);
      setError(data?.message ?? "Invalid credentials");
      return;
    }

    localStorage.removeItem("login-email");

      window.dispatchEvent(new Event("user-login"));
      window.dispatchEvent(new Event("user-updated"));

      router.push(data.user.role === "viewer" ? "/" : "/admin");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    // <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
  <main
        className="
        min-h-screen
        flex items-center justify-center
        px-4
        bg-gradient-to-br
        from-[#0f172a]
        via-[#1e3a8a]
        to-[#0f172a]
        relative
        overflow-hidden
      "
      >

  {/* Cinematic glow */}
  <div className="absolute inset-0 -z-10 pointer-events-none">
      <div className="
        absolute
        top-1/2 left-1/2
        -translate-x-1/2 -translate-y-1/2
        w-[800px] h-[800px]
        bg-blue-500/10
        blur-3xl
        rounded-full
      " />
    </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">

<Link
  href="/"
  className="
    inline-flex items-center gap-2
    text-sm text-slate-300
    hover:text-white
    transition
  "
>
  <ChevronsLeft className="w-4 h-4" />
  Back to Church Website
</Link>

    
  <form onSubmit={handleSubmit} className="space-y-6">

         {/* GLASS FRAME (p-4 ) */}
        <div
            className="
              rounded-2xl
              p-4
              bg-white/20 dark:bg-slate-900/20
              backdrop-blur-md
              border border-white/20 dark:border-white/10
              shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]

            "
          >
        {/* INNER CARD CONTENT */}
            <div
                  className={`
                    rounded-xl
                    bg-white dark:bg-slate-900
                    p-6 space-y-6
                    fade-in
                    ${error ? "shake" : ""}
                  `}
                >

              {/* LOGO */}
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/default-avatar.png"
                  alt="Bayugon Church of Christ"
                  width={64}
                  height={64}
                  priority
                />
                <h1 className="text-lg font-semibold text-center">
                  Bayugon Church of Christ
                </h1>
                <p className="text-md text-slate-600">Members Login</p>
              </div>

              {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded fade-in">
                    {error}
                  </p>
                )}
        {/* EMAIL */}
          <div className="relative">
          <input
           ref={emailRef}
            type="email"
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
            required
            placeholder=" "
            className={`
              peer
              w-full
              rounded
              px-3 py-3
              text-sm
              bg-transparent
              focus:outline-none
              transition
              ${error ? "input-error" : "border border-slate-300 dark:border-slate-700"}
            `}
          />
            <label
              className="
                absolute
                left-3
                -top-2.5
                text-xs
                bg-white dark:bg-slate-900
                px-1
                text-slate-600 dark:text-slate-400
                transition-all
                pointer-events-none

                peer-placeholder-shown:top-3.5
                peer-placeholder-shown:text-sm

                peer-focus:-top-2.5
                peer-focus:text-xs
                peer-focus:text-slate-900 dark:peer-focus:text-white
              "
            >
              Email
            </label>
          </div>
        {/* PASSWORD */}
            <div className="relative">
            <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
                required
                placeholder=" "
                className={`
                  peer
                  w-full
                  rounded
                  px-3 py-3 pr-10
                  text-sm
                  bg-transparent
                  focus:outline-none
                  transition
                  ${error ? "input-error" : "border border-slate-300 dark:border-slate-700"}
                `}
              />
              <label
                className="
                  absolute
                  left-3
                  -top-2.5
                  text-xs
                  bg-white dark:bg-slate-900
                  px-1
                  text-slate-600 dark:text-slate-400
                  transition-all
                  pointer-events-none

                  peer-placeholder-shown:top-3.5
                  peer-placeholder-shown:text-sm

                  peer-focus:-top-2.5
                  peer-focus:text-xs
                  peer-focus:text-slate-900 dark:peer-focus:text-white
                "
              >
                Password
              </label>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-3 top-3
                  text-slate-500
                  hover:text-slate-900 dark:hover:text-white
                  transition
                  active:scale-90
                "
              >

          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

        {capsOn && (
          <p className="text-xs text-yellow-600">
            ⚠ Caps Lock is ON
          </p>
        )}

        {/* PASSWORD STRENGTH */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded ${
                strength >= i
                  ? i <= 2
                    ? "bg-red-500"
                    : i === 3
                    ? "bg-yellow-500"
                    : "bg-green-500"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* LEGAL AGREEMENT — CLEAN VERSION */}
          <div className="space-y-3 pt-2">

            <label className="flex items-start gap-2 text-xs leading-relaxed">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue-700 cursor-pointer"
              />
              <span>
                I agree to the{" "}
                <Link href="/privacy" className="text-blue-600 dark:text-blue-400 underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-blue-600 dark:text-blue-400 underline">
                  Terms of Service
                </Link>.
              </span>
            </label>
          </div>

          <button
            disabled={loading || !accepted}
            className="
              w-full py-2 rounded-full
              shadow-xl shadow-blue-400/60
              dark:shadow-blue-900/20
              bg-blue-800 text-white
              dark:bg-blue-600 hover:bg-blue-900 
              dark:hover:bg-blue-800 font-medium
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>


          {/* <button
              disabled={loading}
              className="
                w-full py-2 rounded-full
                shadow-xl shadow-blue-400/60
                dark:shadow-blue-900/20
                bg-blue-800 text-white
                dark:bg-blue-600 hover:bg-blue-900 
                dark:hover:bg-blue-800 font-medium
                disabled:opacity-70
                disabled:cursor-not-allowed
                transition
              "
            >
          {loading ? "Logging in..." : "Login"}
        </button> */}

          <div className=" space-y-2">
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                    Member accounts are provided by the church administration.
                  </p>

                  <p className="text-center text-sm text-slate-600 dark:text-slate-200">
                    Not a member?{" "}
                    <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Contact us
                    </Link>
                  </p>         
             </div>
          </div>
        </div>
      </form>     
      </div>
    </main>
  );
}



// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Eye, EyeOff } from "lucide-react";
// import Image from "next/image";


// import { motion } from "framer-motion";


// export default function LoginPage() {
//   const router = useRouter();

//   const [mounted, setMounted] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [strength, setStrength] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [capsOn, setCapsOn] = useState(false);

//   // ✅ HOOK #1
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ✅ HOOK #2
//   useEffect(() => {
//     let score = 0;
//     if (password.length >= 8) score++;
//     if (/[A-Z]/.test(password)) score++;
//     if (/[0-9]/.test(password)) score++;
//     if (/[^A-Za-z0-9]/.test(password)) score++;
//     setStrength(score);
//   }, [password]);

//   if (!mounted) return null;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data?.message ?? "Invalid credentials");
//         return;
//       }

//       window.dispatchEvent(new Event("user-login"));
//       window.dispatchEvent(new Event("user-updated"));

//       router.push(data.user.role === "viewer" ? "/" : "/admin");
//     } catch {
//       setError("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 space-y-6"
//       >
//         {/* LOGO */}
//         <div className="flex flex-col items-center gap-2">
//           <Image
//             src="/default-avatar.png"
//             alt="Bayugon Church of Christ"
//             width={64}
//             height={64}
//             priority
//           />
//           <h1 className="text-lg font-semibold text-center">
//             Bayugon Church of Christ
//           </h1>
//           <p className="text-sm text-slate-500">Member Login</p>
//         </div>

//         {error && (
//           <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
//             {error}
//           </p>
//         )}

//         {/* EMAIL */}
//         <div className="relative">
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="peer w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white"
//             placeholder=" "
//           />
//           <label
//             className="
//               absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-slate-900
//               text-slate-600 dark:text-slate-400
//               transition-all
//               peer-placeholder-shown:top-3.5
//               peer-placeholder-shown:text-sm
//               peer-focus:-top-2.5
//               peer-focus:text-xs
//               peer-focus:text-slate-900 dark:peer-focus:text-white
//             "
//           >
//             Email
//           </label>
//         </div>

//         {/* PASSWORD */}
//         <div className="relative space-y-2">
//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="peer w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white"
//               placeholder=" "
//             />
//             <label
//               className="
//                 absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-slate-900
//                 text-slate-600 dark:text-slate-400
//                 transition-all
//                 peer-placeholder-shown:top-3.5
//                 peer-placeholder-shown:text-sm
//                 peer-focus:-top-2.5
//                 peer-focus:text-xs
//                 peer-focus:text-slate-900 dark:peer-focus:text-white
//               "
//             >
//               Password
//             </label>

//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-3 text-slate-500 hover:text-slate-900 dark:hover:text-white"
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>


//         </div>


//         {capsOn && (
//           <p className="text-xs text-yellow-600">
//             ⚠ Caps Lock is ON
//           </p>
//         )}

//         {/* PASSWORD STRENGTH */}
//         <div className="flex gap-1">
//           {[1, 2, 3, 4].map(i => (
//             <div
//               key={i}
//               className={`h-1 flex-1 rounded ${
//                 strength >= i
//                   ? i <= 2
//                     ? "bg-red-500"
//                     : i === 3
//                     ? "bg-yellow-500"
//                     : "bg-green-500"
//                   : "bg-slate-200"
//               }`}
//             />
//           ))}
//         </div>

//         <button
//           disabled={loading}
//           className="w-full py-2 rounded bg-slate-900 text-white disabled:opacity-70"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </main>
//   );
// }






// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const res = await fetch("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       setError(data?.message ?? "Invalid credentials");
//       setLoading(false);
//       return;
//     }

//     router.push(data.user.role === "viewer" ? "/" : "/admin");
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4"
//       >
//         <h1 className="text-xl font-bold text-center">Login</h1>

//         {error && <p className="text-red-600 text-sm">{error}</p>}

//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full border px-3 py-2"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full border px-3 py-2"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           disabled={loading}
//           className="w-full bg-slate-900 text-white py-2 rounded"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { Eye, EyeOff } from "lucide-react";
// import Image from "next/image";

// export default function LoginPage() {
//   const router = useRouter();

//   const [mounted, setMounted] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [strength, setStrength] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [capsOn, setCapsOn] = useState(false);

//   // ✅ HOOK #1
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // ✅ HOOK #2 (MUST ALWAYS RUN)
//   useEffect(() => {
//     let score = 0;
//     if (password.length >= 8) score++;
//     if (/[A-Z]/.test(password)) score++;
//     if (/[0-9]/.test(password)) score++;
//     if (/[^A-Za-z0-9]/.test(password)) score++;
//     setStrength(score);
//   }, [password]);

//   // ✅ RETURN AFTER ALL HOOKS
//   if (!mounted) return null;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data?.message ?? "Invalid credentials");
//         return;
//       }

//       window.dispatchEvent(new Event("user-login"));
//       window.dispatchEvent(new Event("user-updated"));

//       router.push(data.user.role === "viewer" ? "/" : "/admin");
//     } catch {
//       setError("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

// //   return (
// //   <div style={{ color: "red", fontSize: 30 }}>
// //     LOGIN PAGE TEST
// //   </div>
// // );

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
//       <motion.form
//         onSubmit={handleSubmit}
//         initial={{ opacity: 0, y: 20 }}
//         animate={error ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
//         transition={{ duration: 0.35 }}
//         className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 space-y-6"
//       >

//         {/* LOGO + TITLE */}
//         <div className="flex flex-col items-center gap-2">
//           <Image
//             src="/default-avatar.png"
//             alt="Bayugon Church of Christ"
//             width={64}
//             height={64}
//             priority
//           />
//           <h1 className="text-lg font-semibold text-center text-slate-900 dark:text-white">
//             Bayugon Church of Christ
//           </h1>
//           <p className="text-sm text-slate-500 dark:text-slate-400">
//             Member Login
//           </p>
//         </div>

//         {error && (
//           <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
//             {error}
//           </p>
//         )}

//         {/* EMAIL */}
//         <div className="relative">
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             placeholder=" "
//             className="peer w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white"
//           />
//           <label className="absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-slate-900
//             text-slate-600 dark:text-slate-400 transition-all
//             peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
//             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-slate-900 dark:peer-focus:text-white">
//             Email
//           </label>
//         </div>

//         {/* PASSWORD */}
//         <div className="space-y-1">
//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
//               required
//               placeholder=" "
//               className="peer w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white"
//             />

//             <label className="absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-slate-900
//               text-slate-600 dark:text-slate-400 transition-all
//               peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm
//               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-slate-900 dark:peer-focus:text-white">
//               Password
//             </label>

//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-3 text-slate-500 hover:text-slate-900 dark:hover:text-white"
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           {capsOn && (
//             <p className="text-xs text-yellow-600 dark:text-yellow-400">
//               ⚠ Caps Lock is ON
//             </p>
//           )}

//           {/* PASSWORD STRENGTH */}
//           <div className="flex gap-1 mt-1">
//             {[1, 2, 3, 4].map(i => (
//               <motion.div
//               key={i}
//               className={`h-1 flex-1 rounded ${
//                 strength >= i
//                   ? i <= 2 ? "bg-red-500"
//                   : i === 3 ? "bg-yellow-500"
//                   : "bg-green-500"
//                   : "bg-slate-200 dark:bg-slate-700"
//               }`}
//             />

//             ))}
//           </div>
//         </div>

//         <button
//           disabled={loading}
//           className="w-full py-2 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium disabled:opacity-70"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </motion.form>
//     </main>
//   );
// }




// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();

//   const [mounted, setMounted] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   if (!mounted) return null;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data?.message ?? "Invalid email or password");
//         return;
//       }

//       window.dispatchEvent(new Event("user-login"));
//       window.dispatchEvent(new Event("user-updated"));

//       if (data.user.role === "viewer") {
//         router.push("/");
//       } else {
//         router.push("/admin");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Something went wrong. Check server logs.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-slate-100">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm space-y-4"
//       >
//         <h1 className="text-xl font-semibold text-center">Login</h1>

//         {error && (
//           <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
//             {error}
//           </p>
//         )}

//         <div className="space-y-1">
//           <label className="text-sm font-medium">Email</label>
//           <input
//             type="email"
//             className="w-full border rounded px-3 py-2 text-sm"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="space-y-1">
//           <label className="text-sm font-medium">Password</label>
//           <input
//             type="password"
//             className="w-full border rounded px-3 py-2 text-sm"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button
//           disabled={loading}
//           className="w-full py-2 rounded bg-slate-900 text-white text-sm font-medium disabled:opacity-70"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </main>
//   );
// }



// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { Eye, EyeOff } from "lucide-react";

// export default function LoginPage() {
//   const router = useRouter();

//   const [mounted, setMounted] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [strength, setStrength] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     let score = 0;
//     if (password.length >= 8) score++;
//     if (/[A-Z]/.test(password)) score++;
//     if (/[0-9]/.test(password)) score++;
//     if (/[^A-Za-z0-9]/.test(password)) score++;
//     setStrength(score);
//   }, [password]);

//   if (!mounted) return null;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data?.message ?? "Invalid credentials");
//         return;
//       }

//       router.push(data.user.role === "viewer" ? "/" : "/admin");
//     } catch {
//       setError("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
//       <motion.form
//         onSubmit={handleSubmit}
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 space-y-6"
//       >
//         <h1 className="text-xl font-semibold text-center text-slate-900 dark:text-white">
//           Login
//         </h1>

//         {error && (
//           <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 p-2 rounded">
//             {error}
//           </p>
//         )}

//         {/* EMAIL */}
//         <div className="relative">
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             className="peer w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white"
//             placeholder=" "
//           />
//           <label
//             className="
//               absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-slate-900
//               text-slate-600 dark:text-slate-400
//               transition-all
//               peer-placeholder-shown:top-3.5
//               peer-placeholder-shown:text-sm
//               peer-focus:-top-2.5
//               peer-focus:text-xs
//               peer-focus:text-slate-900 dark:peer-focus:text-white
//             "
//           >
//             Email
//           </label>
//         </div>

//         {/* PASSWORD */}
//         <div className="relative space-y-2">
//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="peer w-full border border-slate-300 dark:border-slate-700 bg-transparent rounded px-3 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-white"
//               placeholder=" "
//             />
//             <label
//               className="
//                 absolute left-3 -top-2.5 px-1 text-xs bg-white dark:bg-slate-900
//                 text-slate-600 dark:text-slate-400
//                 transition-all
//                 peer-placeholder-shown:top-3.5
//                 peer-placeholder-shown:text-sm
//                 peer-focus:-top-2.5
//                 peer-focus:text-xs
//                 peer-focus:text-slate-900 dark:peer-focus:text-white
//               "
//             >
//               Password
//             </label>

//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-3 text-slate-500 hover:text-slate-900 dark:hover:text-white"
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           {/* PASSWORD STRENGTH */}
//           <div className="flex gap-1">
//             {[1, 2, 3, 4].map((i) => (
//               <motion.div
//                 key={i}
//                 layout
//                 className={`h-1 flex-1 rounded ${
//                   strength >= i
//                     ? i <= 2
//                       ? "bg-red-500"
//                       : i === 3
//                       ? "bg-yellow-500"
//                       : "bg-green-500"
//                     : "bg-slate-200 dark:bg-slate-700"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>

//         <button
//           disabled={loading}
//           className="w-full py-2 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium disabled:opacity-70"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </motion.form>
//     </main>
//   );
// }
