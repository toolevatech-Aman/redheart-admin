import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, Shield } from "lucide-react";
import logo from "../../assets/redHeartLogoo.png";
import { googleAuthApi } from "../../service/loginService";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function LoginWithGoogle() {
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate   = useNavigate();
  const btnRef     = useRef(null);

  useEffect(() => {
    // Load Google GSI script
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      initGoogle();
      return;
    }
    const script = document.createElement("script");
    script.id  = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initGoogle = () => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleCredential,
    });
    if (btnRef.current) {
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size:  "large",
        width: "360",
        text:  "signin_with",
        shape: "rectangular",
      });
    }
  };

  const handleCredential = async ({ credential }) => {
    setLoading(true);
    setError("");
    try {
      const res = await googleAuthApi(credential);
      if (res.user?.role !== "admin") {
        setError("Access denied. This account does not have admin privileges.");
        return;
      }
      localStorage.setItem("authToken", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/home");
      window.location.reload();
    } catch (err) {
      setError(err?.response?.data?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50/50 to-gray-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-rose-200 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-md text-center">
            <img src={logo} alt="RedHeart" className="h-16 w-auto mx-auto mb-6" />
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-rose-200/50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-rose-600" strokeWidth={2} />
              <span className="text-xs text-rose-700 font-light tracking-wider uppercase">Admin Panel</span>
            </div>
            <h2 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">RedHeart Admin</h2>
            <p className="text-lg text-gray-500 font-light leading-relaxed mb-8">
              Manage products, orders, SEO and city pages from one place.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: Heart,   title: "Product Management",  sub: "Add, edit and sequence products" },
                { icon: Shield,  title: "Secure Access",       sub: "Google-authenticated admin access" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg text-left">
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-rose-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{title}</p>
                    <p className="text-xs text-gray-500 font-light">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src={logo} alt="RedHeart" className="h-12 w-auto" />
          </div>

          <div className="border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm bg-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-50 rounded-full border border-rose-100 mb-4">
                <Shield className="w-8 h-8 text-rose-600" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Admin Sign In</h1>
              <p className="text-sm text-gray-500">Sign in with your authorised Google account</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading overlay */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Signing you in…</p>
              </div>
            )}

            {/* Google Sign-In button rendered by GSI */}
            {!loading && (
              <div className="flex justify-center">
                <div ref={btnRef} />
              </div>
            )}

            <p className="text-xs text-gray-400 text-center mt-6">
              Only authorised admin accounts can access this panel.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
