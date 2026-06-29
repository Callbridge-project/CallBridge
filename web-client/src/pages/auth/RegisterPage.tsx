import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  RefreshCw, 
  Cloud, 
  Smartphone, 
  LayoutGrid, 
  MessageSquare,
  Lock,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "@/components/layout/AuthLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import mockup image
import laptopMockupImg from "@/assets/images/laptop-mockup.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceBrand, setDeviceBrand] = useState("Samsung");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Field errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    deviceBrand?: string;
    agreedToTerms?: string;
    form?: string;
  }>({});

  const validateForm = () => {
    const tempErrors: typeof errors = {};
    let isValid = true;

    if (!name.trim()) {
      tempErrors.name = "Full name is required";
      isValid = false;
    }

    if (!email) {
      tempErrors.email = "Email address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      tempErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!deviceBrand) {
      tempErrors.deviceBrand = "Please select your Android device brand";
      isValid = false;
    }

    if (!agreedToTerms) {
      tempErrors.agreedToTerms = "You must agree to the Terms & Privacy Policy";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating your account...");

    try {
      // ── Appwrite account registration ────────────────────────
      const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === "true";
      
      if (isMockMode) {
        // Simulate registration delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        // Real Appwrite account creation
        const { account, databases, APPWRITE_DATABASE_ID, USERS_COLLECTION_ID } = await import("@/lib/appwrite");
        const { ID, Permission, Role } = await import("appwrite");
        const user = await account.create(ID.unique(), email, password, name);

        // Create user document in the database
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          USERS_COLLECTION_ID,
          user.$id,
          {
            user_id: user.$id,
            full_name: name,
            email: email,
            created_at: new Date().toISOString()
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
      }

      toast.success("Account created successfully!", { id: toastId });
      
      // Automatically log the user in to establish session
      const loginToastId = toast.loading("Logging you in automatically...");
      await login(email, password);
      toast.success("Welcome to CallBridge!", { id: loginToastId });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setErrors({ form: error?.message || "An unexpected error occurred. Please try again." });
      toast.error(error?.message || "Account creation failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthLayout
        heroSlot={
          <>
            <div className="inline-flex max-w-max items-center gap-1.5 rounded-full bg-[#EBF3FC] border border-primary/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              REAL-TIME TELEPHONY PLATFORM
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] leading-[1.1]">
              Create Your
              <span className="text-primary font-bold ml-3">
                CallBridge Account
              </span>
            </h1>

            <p className="mt-6 text-base text-slate-500 sm:text-lg font-normal leading-relaxed max-w-md">
              Securely synchronize your Android call logs, SMS activity, and device monitoring data with your personalized web dashboard.
            </p>

            {/* Vertical bullets list */}
            <div className="mt-8 space-y-4">
              
              {/* Bullet 1 */}
              <div className="flex items-center gap-4 relative">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <Cloud className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Real-time synchronization</span>
                
                {/* Floating badge */}
                <div className="ml-4 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-3 py-1 shadow-badge-blue">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-semibold text-slate-700">SMS Activity</span>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Secure monitoring access</span>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Lightweight Android integration</span>
              </div>

              {/* Bullet 4 */}
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Personal dashboard visibility</span>
              </div>
            </div>

            {/* Premium Laptop Illustration with Floating Badges */}
            <div className="relative mt-12 hidden w-full lg:block max-w-[480px]">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] flex items-center justify-center p-0">
                
                {/* Laptop image */}
                <img 
                  src={laptopMockupImg} 
                  alt="CallBridge Web Dashboard Mockup" 
                  className="h-[95%] w-[95%] object-contain pointer-events-none animate-float-slow"
                />
                
                {/* Badge 1: Calls Synced */}
                <div className="absolute top-4 -left-10 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" style={{ animationDuration: "15s" }} />
                  <span className="text-xs font-semibold text-slate-700">Calls Synced</span>
                </div>

                {/* Badge 2: Monitoring Active */}
                <div className="absolute bottom-4 -right-10 flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm border border-white/20 px-4 py-2 shadow-badge-blue z-10">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700">Monitoring Active</span>
                </div>
              </div>
            </div>
          </>
        }
        cardSlot={
          <>
            {/* Form Card */}
            <div className="w-full rounded-[2.25rem] bg-white/70 backdrop-blur-md border border-white/20 p-8 shadow-badge-blue sm:p-10">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Get Started</h2>
                <p className="mt-2.5 text-sm font-normal text-slate-400">Create your account to continue</p>
              </div>

              {/* Global Error Banner */}
              {errors.form && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 border border-red-100/50">
                  <p className="text-sm font-semibold text-red-600">{errors.form}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="flex flex-col gap-2">                
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold capitalize text-[#0B1B35]">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-xs font-semibold text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold capitalize text-[#0B1B35]">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-xs font-semibold text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password & Confirm Password (side by side on desktop) */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold capitalize text-[#0B1B35]">Password</Label>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
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
                      {errors.password && (
                        <p className="text-xs font-semibold text-red-500 mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold capitalize text-[#0B1B35]">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`h-12 rounded-full border-global-border px-4 focus-visible:ring-blue-500 ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }}
                        disabled={isSubmitting}
                        endContent={
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600 transition focus:outline-none mr-1"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        }
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs font-semibold text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Android Device Brand (Dropdown select) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold capitalize text-[#0B1B35]">Android Device Brand</Label>
                    <Select
                      value={deviceBrand}
                      onValueChange={(value) => {
                        setDeviceBrand(value);
                        if (errors.deviceBrand) setErrors((prev) => ({ ...prev, deviceBrand: undefined }));
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-12 rounded-full border border-global-border px-4 bg-white text-sm w-full text-slate-700 font-normal">
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-xl shadow-lg">
                        <SelectItem value="Samsung">Samsung</SelectItem>
                        <SelectItem value="Google Pixel">Google Pixel</SelectItem>
                        <SelectItem value="OnePlus">OnePlus</SelectItem>
                        <SelectItem value="Xiaomi">Xiaomi</SelectItem>
                        <SelectItem value="Motorola">Motorola</SelectItem>
                        <SelectItem value="Huawei">Huawei</SelectItem>
                        <SelectItem value="Oppo/Vivo">Oppo / Vivo</SelectItem>
                        <SelectItem value="Other">Other Brand</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] font-normal text-slate-400 leading-normal pl-1">
                      Your dashboard will automatically sync once the Android app permissions are enabled.
                    </p>
                    {errors.deviceBrand && (
                      <p className="text-xs font-semibold text-red-500 mt-1">{errors.deviceBrand}</p>
                    )}
                  </div>

                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => {
                        setAgreedToTerms(!!checked);
                        if (errors.agreedToTerms) setErrors((prev) => ({ ...prev, agreedToTerms: undefined }));
                      }}
                      disabled={isSubmitting}
                      className="h-4 w-4 border-slate-350 rounded focus-visible:ring-blue-500 mt-0.5"
                    />
                    <label htmlFor="terms" className="text-xs font-normal text-slate-500 cursor-pointer select-none leading-relaxed">
                      I agree to the{" "}
                      <Link to="/policy" className="text-primary font-semibold hover:underline transition">
                        Terms of Service
                      </Link>
                      {" "}&{" "}
                      <Link to="/policy" className="text-primary font-semibold hover:underline transition">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.agreedToTerms && (
                    <p className="text-xs font-semibold text-red-500 mt-1 pl-6">{errors.agreedToTerms}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-12 w-full bg-btn-primary-gradient shadow-btn-primary text-white rounded-full font-semibold hover:opacity-95 active:opacity-90 transition-all duration-200 mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-global-border/30" />
                </div>
                <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <span className="bg-white px-3">Or</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full border border-global-border hover:bg-slate-50 hover:text-slate-900 rounded-full font-semibold flex items-center justify-center gap-2.5 transition bg-white"
                disabled={isSubmitting}
                onClick={() => toast("Google signup is currently under development.")}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>

              <p className="mt-8 text-center text-sm font-normal text-slate-500">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline transition font-semibold" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
                  Login
                </a>
              </p>
            </div>

            {/* highlights row */}
            <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-slate-400 font-normal">
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Encrypted Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Secure Dashboard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-primary" />
                <span>Lightweight Integration</span>
              </div>
            </div>
          </>
        }
      />

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
