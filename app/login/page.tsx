"use client";

import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [ssoLoading, setSsoLoading] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);
    const router = useRouter();

    const handleSSO = async (provider: "google" | "linkedin") => {
        setError("");
        setSsoLoading(provider);

        try {
            const result = await signIn(provider, {
                redirect: false,
                callbackUrl: "/",
            });

            if (result?.error) {
                setError("SSO authentication failed. Please try again.");
                setSsoLoading(null);
            } else if (result?.ok) {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            setSsoLoading(null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email) {
            setError("Please enter your email");
            setLoading(false);
            return;
        }

        try {
            // Request magic link to be sent to email
            const response = await fetch("/api/auth/send-magic-link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to send magic link. Please try again.");
                setLoading(false);
            } else {
                // Show success message
                setEmailSent(true);
                setLoading(false);
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side */}
            <div className="flex-1 flex flex-col relative">
                {/* Top Left Logo */}
                <div className="p-8 pb-0">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="Betafits"
                            width={120}
                            height={32}
                            className="h-8 w-auto"
                            quality={100}
                            priority
                        />
                    </Link>
                </div>

                {/* Centered Form Card */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-[420px] bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 py-12">
                        {/* Welcome Text */}
                        <div className="text-center mb-10">
                            <h1 className="text-[28px] font-bold text-gray-900 mb-2">
                                Welcome back
                            </h1>
                            <p className="text-gray-500 text-sm">Log in to continue</p>
                        </div>

                        {/* SSO Buttons - Primary */}
                        <div className="space-y-3 mb-8">
                            <button
                                type="button"
                                onClick={() => handleSSO("google")}
                                disabled={ssoLoading !== null || loading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {ssoLoading === "google" ? (
                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path
                                            d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                <span className="text-sm font-semibold">Continue with Google</span>
                            </button>

                            {/* LinkedIn Button (optional - can be enabled when credentials are added) */}
                            {process.env.NEXT_PUBLIC_ENABLE_LINKEDIN === "true" && (
                                <button
                                    type="button"
                                    onClick={() => handleSSO("linkedin")}
                                    disabled={ssoLoading !== null || loading}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {ssoLoading === "linkedin" ? (
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0077B5">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    )}
                                    <span className="text-sm font-semibold">Continue with LinkedIn</span>
                                </button>
                            )}
                        </div>

                        {/* Email Form - Secondary */}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-8">
                                <label
                                    htmlFor="email"
                                    className="block text-xs font-bold text-gray-700 mb-2 tracking-wide"
                                >
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={emailSent}
                                    className="w-full px-4 py-4 rounded-xl text-gray-900 text-[15px] outline-none transition-all bg-gray-50/80 border-none focus:ring-1 focus:ring-[#97C25E]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-medium text-center">
                                    {error}
                                </div>
                            )}

                            {emailSent && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-xs font-medium text-center">
                                    Check your email for a magic link to sign in.
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || ssoLoading !== null || emailSent}
                                className="w-full bg-[#97C25E] hover:bg-[#8bb356] text-white font-bold py-4 rounded-xl text-[15px] transition-all shadow-sm shadow-[#97C25E]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Sending..." : "Continue"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Betafits Image & Centered Branding */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-b from-[#97C25E] to-[#f0f8e8]">
                <Image
                    src="/betafits-right-image.png"
                    alt="Betafits Background"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center top' }}
                    quality={100}
                    priority
                />
            </div>
        </div>
    );
}



