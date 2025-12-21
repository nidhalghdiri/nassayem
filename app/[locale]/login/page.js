// app/login/page.js
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { useTranslations } from "@/lib/translations";

export default function LoginPage() {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("en");
  const translate = useTranslations(currentLocale);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/en/admin";

  useEffect(() => {
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with:", email);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      console.log("Full SignIn Result:", result);

      if (result?.error) {
        setError(
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error
        );
        console.error("Sign-in error details:", result);

        setLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("Login successful, redirecting to:", callbackUrl);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // return (
  //   <>
  //     <Layout
  //       headerStyle={1}
  //       footerStyle={1}
  //       breadcrumbTitle={"Login"}
  //       currentLocale={"en"}
  //     >
  //       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  //         <div className="max-w-md w-full space-y-8">
  //           <div>
  //             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
  //               Front Desk Login
  //             </h2>
  //             <p className="mt-2 text-center text-sm text-gray-600">
  //               Receptionist Portal
  //             </p>
  //           </div>
  //           <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
  //             <div className="rounded-md shadow-sm -space-y-px">
  //               <div>
  //                 <label htmlFor="email" className="sr-only">
  //                   Email address
  //                 </label>
  //                 <input
  //                   id="email"
  //                   name="email"
  //                   type="email"
  //                   autoComplete="email"
  //                   required
  //                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
  //                   placeholder="Email address"
  //                   value={email}
  //                   onChange={(e) => setEmail(e.target.value)}
  //                   disabled={loading}
  //                 />
  //               </div>
  //               <div>
  //                 <label htmlFor="password" className="sr-only">
  //                   Password
  //                 </label>
  //                 <input
  //                   id="password"
  //                   name="password"
  //                   type="password"
  //                   autoComplete="current-password"
  //                   required
  //                   className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
  //                   placeholder="Password"
  //                   value={password}
  //                   onChange={(e) => setPassword(e.target.value)}
  //                   disabled={loading}
  //                 />
  //               </div>
  //             </div>

  //             {error && (
  //               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
  //                 {error}
  //               </div>
  //             )}

  //             <div>
  //               <button
  //                 type="submit"
  //                 disabled={loading}
  //                 className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  //               >
  //                 {loading ? (
  //                   <span className="flex items-center">
  //                     <svg
  //                       className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
  //                       xmlns="http://www.w3.org/2000/svg"
  //                       fill="none"
  //                       viewBox="0 0 24 24"
  //                     >
  //                       <circle
  //                         className="opacity-25"
  //                         cx="12"
  //                         cy="12"
  //                         r="10"
  //                         stroke="currentColor"
  //                         strokeWidth="4"
  //                       ></circle>
  //                       <path
  //                         className="opacity-75"
  //                         fill="currentColor"
  //                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //                       ></path>
  //                     </svg>
  //                     Signing in...
  //                   </span>
  //                 ) : (
  //                   "Sign in"
  //                 )}
  //               </button>
  //             </div>

  //             <div className="text-sm text-center">
  //               <Link
  //                 href="/forgot-password"
  //                 className="font-medium text-blue-600 hover:text-blue-500"
  //               >
  //                 Forgot your password?
  //               </Link>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     </Layout>
  //   </>
  // );
  return (
    <>
      <Layout>
        <section className="flat-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="flat-account bg-surface">
                  <h3 className="title text-center">Log In</h3>
                  <form onSubmit={handleSubmit}>
                    <fieldset className="box-fieldset">
                      <label htmlFor="email">
                        Email address<span>*</span>:
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="form-contact style-1"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </fieldset>
                    <fieldset className="box-fieldset">
                      <label htmlFor="password">
                        Password<span>*</span>:
                      </label>
                      <div className="box-password">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          className="form-contact style-1 password-field"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                        />
                        <span className="show-pass">
                          <i className="icon-pass icon-eye" />
                          <i className="icon-pass icon-eye-off" />
                        </span>
                      </div>
                    </fieldset>
                    <div className="d-flex justify-content-between flex-wrap garap gap-12">
                      <fieldset className="d-flex align-items-center gap-6">
                        <input
                          type="checkbox"
                          className="tf-checkbox style-2"
                          id="cb1"
                        />
                        <label
                          htmlFor="cb1"
                          className="caption-1 text-variant-1"
                        >
                          Remember me
                        </label>
                      </fieldset>
                      <Link href="#" className="caption-1 text-primary">
                        Forgot password?
                      </Link>
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                        {error}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="tf-btn primary w-100"
                    >
                      Login
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
