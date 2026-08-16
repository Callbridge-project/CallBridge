import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import phoneMockupImg from "@/assets/images/CallBridge Android Mockup.png";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const secret = searchParams.get("secret") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId || !secret) {
      setError("Invalid or expired recovery link. Please request a new password reset email.");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    } else if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Updating password...");

    try {
      await account.updateRecovery(userId, secret, password);
      setIsSuccess(true);
      toast.success("Password reset successful!", { id: toastId });
    } catch (err: any) {
      console.error("Reset failed:", err);
      const errMsg = err?.message || "Failed to update password. Please request a new recovery link.";
      setError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      heroSlot={
        <>
          <div className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-white/70 shadow-badge-blue border border-white/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Account Security
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] leading-[1.1]">
            Create a New <br />
            <span className="text-primary">
              Secure Password
            </span>
          </h1>

          <p className="mt-6 text-base text-slate-500 sm:text-lg font-normal leading-relaxed max-w-md">
            Enter your new password below. Make sure it contains at least 8 characters and combines letters, numbers, and special symbols.
          </p>

          {/* ILLUSTRATION */}
          {/* <div className="relative mt-12 hidden w-full lg:block max-w-[460px]">
            <div className="relative w-full aspect-square rounded-[2rem] flex items-center justify-center p-0">
              <img 
                src={phoneMockupImg} 
                alt="CallBridge Android Mockup" 
                className="h-[90%] w-[98%] object-contain pointer-events-none animate-float-slow"
              />
              <div className="absolute top-[32%] -left-10 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-slate-700">Password Update</span>
              </div>
            </div>
          </div> */}
        </>
      }
      cardSlot={
        <div className="w-full rounded-[2.25rem] bg-white/70 backdrop-blur-md border border-white/20 p-8 shadow-badge-blue sm:p-10">
          {!isSuccess ? (
            <>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">New Password</h2>
                <p className="mt-2.5 text-sm font-normal text-slate-400">
                  Please enter and confirm your new password below.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-100/50 flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold capitalize text-[#0B1B35]">New Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${error && !password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={isSubmitting}
                    endContent={
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-600 transition focus:outline-none mr-1"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold capitalize text-[#0B1B35]">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${error && password !== confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-btn-primary-gradient text-white rounded-full font-bold shadow-btn-primary hover:scale-[1.02] active:scale-98 transition duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Saving Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-5">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Success!</h2>
              <p className="mt-3.5 text-sm text-slate-500 font-normal leading-relaxed max-w-sm mx-auto">
                Your password has been successfully updated. You can now log in using your new credentials.
              </p>

              <div className="mt-8">
                <Button
                  onClick={() => navigate("/login")}
                  className="w-full h-12 bg-btn-primary-gradient text-white rounded-full font-bold shadow-btn-primary hover:scale-[1.02] active:scale-98 transition duration-200 flex items-center justify-center gap-2"
                >
                  Go to Login
                  <ArrowRight className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
