import React, { useState } from "react";
import { sendOtpApi, verifyOtpApi } from "../../service/loginService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Smartphone, Shield, Check, Sparkles, Heart, ArrowRight } from "lucide-react";
import logo from "../../assets/redHeartLogoo.png";


export default function LoginWithOTP() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("mobile");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  
  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const updated = [...otp];
      updated[index] = value;
      setOtp(updated);

      // Auto focus next
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      const res = await sendOtpApi(mobile);

      // expecting: { sessionId: "xxxx-xxx", message: "Otp sent" }
      setSessionId(res.sessionId);
      setStep("otp");

    } catch (err) {
      console.error("Send OTP Error:", err);
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const code = otp.join("");
      const res = await verifyOtpApi(sessionId, code, mobile);
      localStorage.setItem("authToken", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      
      console.log("Verified:", res);

      navigate("/home")
      

    } catch (err) {
      console.error("Verify Error:", err);
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-white flex">
      {/* Left Side - Branding/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent-rose-50 via-accent-pink-50/50 to-grey-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent-rose-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-pink-200 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-md text-center">
            <div className="mb-8">
              <img
                src={logo}
                alt="Red Heart Logo"
                className="h-16 w-auto mx-auto mb-6"
              />
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-white/80 backdrop-blur-sm border border-accent-rose-200/50 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-accent-rose-600" strokeWidth={2} />
                <span className="font-body text-xs text-accent-rose-700 font-light tracking-wider uppercase">Premium Florals</span>
              </div>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-black-charcoal mb-6 tracking-tight">
              Welcome to Red Heart
            </h2>
            <p className="font-body text-lg text-grey-700 font-light leading-relaxed mb-8">
              Discover our exquisite collection of premium flowers and gifts, crafted with love and elegance
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 bg-primary-white/60 backdrop-blur-sm border border-grey-200/50 rounded-lg">
                <div className="w-10 h-10 bg-accent-rose-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-accent-rose-600" strokeWidth={2} fill="currentColor" />
                </div>
                <div className="text-left">
                  <p className="font-display text-sm font-light text-black-charcoal">Premium Quality</p>
                  <p className="font-body text-xs text-grey-600 font-light">Handpicked fresh flowers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary-white/60 backdrop-blur-sm border border-grey-200/50 rounded-lg">
                <div className="w-10 h-10 bg-accent-rose-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-rose-600" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="font-display text-sm font-light text-black-charcoal">Secure & Safe</p>
                  <p className="font-body text-xs text-grey-600 font-light">Your data is protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-grey-600 hover:text-accent-rose-600 transition-colors duration-300 mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={2} />
            <span className="font-body text-sm font-light">Back to Home</span>
          </button>

          <div className="bg-primary-white border border-grey-200 p-6 sm:p-8 md:p-10 shadow-elegant">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-accent-rose-100 rounded-full blur-xl opacity-50"></div>
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-rose-100 to-accent-pink-100 rounded-full border-2 border-accent-rose-200">
                  <Lock className="w-10 h-10 text-accent-rose-600" strokeWidth={1.5} />
                </div>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-black-charcoal tracking-tight mb-3">
                {step === "mobile" ? "Welcome Back" : "Verify OTP"}
              </h1>
              <p className="font-body text-base sm:text-lg text-grey-600 font-light">
                {step === "mobile" ? "Sign in to continue your journey" : "Enter the verification code"}
              </p>
            </div>

            {/* STEP: MOBILE */}
            {step === "mobile" && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <label className="block font-body text-sm font-light text-black-charcoal mb-3">
                    Mobile Number <span className="text-accent-rose-600">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <Smartphone className={`w-5 h-5 transition-colors duration-300 ${mobile.length > 0 ? 'text-accent-rose-600' : 'text-grey-400'}`} strokeWidth={2} />
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      maxLength={10}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-grey-50 border-2 border-grey-200 text-black-charcoal font-body text-base font-light focus:outline-none focus:border-accent-rose-600 focus:bg-primary-white transition-all duration-300"
                      placeholder="Enter 10-digit mobile number"
                    />
                    {mobile.length > 0 && mobile.length < 10 && (
                      <p className="mt-2 font-body text-xs text-grey-500 font-light">
                        {10 - mobile.length} digits remaining
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading || mobile.length !== 10}
                  className="group w-full px-8 py-4 bg-gradient-to-r from-accent-rose-600 to-accent-pink-600 hover:from-accent-rose-700 hover:to-accent-pink-700 disabled:from-grey-300 disabled:to-grey-400 disabled:cursor-not-allowed text-primary-white font-body text-sm font-light tracking-wide rounded-full transition-all duration-500 shadow-elegant hover:shadow-premium flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accent-rose-700/0 via-accent-rose-500/30 to-accent-rose-700/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-primary-white border-t-transparent rounded-full animate-spin relative z-10"></span>
                      <span className="relative z-10">Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 relative z-10" strokeWidth={2} />
                      <span className="relative z-10">Send OTP</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                    </>
                  )}
                </button>

                <div className="pt-6 border-t border-grey-200">
                  <p className="font-body text-xs text-grey-500 font-light text-center leading-relaxed">
                    By continuing, you agree to our{" "}
                    <a href="/terms" className="text-accent-rose-600 hover:text-accent-rose-700 transition-colors duration-300">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy-policy" className="text-accent-rose-600 hover:text-accent-rose-700 transition-colors duration-300">Privacy Policy</a>
                  </p>
                </div>
              </div>
            )}

            {/* STEP: OTP */}
            {step === "otp" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center p-4 bg-accent-rose-50 border border-accent-rose-200 rounded-lg">
                  <p className="font-body text-sm text-grey-600 font-light mb-1">
                    OTP sent to
                  </p>
                  <p className="font-display text-lg font-light text-black-charcoal">
                    +91 {mobile}
                  </p>
                </div>

                <div>
                  <label className="block font-body text-sm font-light text-black-charcoal mb-4 text-center">
                    Enter 6-digit OTP
                  </label>
                  <div className="flex justify-center gap-3 sm:gap-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-grey-200 text-center font-display text-2xl sm:text-3xl font-light text-black-charcoal focus:outline-none focus:border-accent-rose-600 focus:bg-primary-white transition-all duration-300 bg-grey-50 hover:border-grey-300"
                      />
                    ))}
                  </div>
                  {otp.every(d => d) && (
                    <p className="mt-3 text-center font-body text-xs text-success font-light">
                      All digits entered
                    </p>
                  )}
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={loading || otp.some(d => !d)}
                  className="group w-full px-8 py-4 bg-gradient-to-r from-accent-rose-600 to-accent-pink-600 hover:from-accent-rose-700 hover:to-accent-pink-700 disabled:from-grey-300 disabled:to-grey-400 disabled:cursor-not-allowed text-primary-white font-body text-sm font-light tracking-wide rounded-full transition-all duration-500 shadow-elegant hover:shadow-premium flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-accent-rose-700/0 via-accent-rose-500/30 to-accent-rose-700/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-primary-white border-t-transparent rounded-full animate-spin relative z-10"></span>
                      <span className="relative z-10">Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 relative z-10" strokeWidth={2} />
                      <span className="relative z-10">Verify OTP</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" strokeWidth={2} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <p className="font-body text-sm text-grey-600 font-light">
                    Didn't receive OTP?
                  </p>
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="font-body text-sm text-accent-rose-600 hover:text-accent-rose-700 font-light transition-colors duration-300 disabled:opacity-50 underline"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  onClick={() => {
                    setStep("mobile");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="w-full text-center font-body text-sm text-grey-600 hover:text-accent-rose-600 font-light transition-colors duration-300 py-2"
                >
                  ← Change Mobile Number
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}