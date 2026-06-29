import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { databases, AppwriteConfig, SUPPORT_TICKETS_COLLECTION_ID, DEVICES_COLLECTION_ID } from "@/lib/appwrite";
import { Query, ID } from "appwrite";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  HelpCircle, 
  Send, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Smartphone,
  ArrowRight,
  BookOpen,
  FileImage,
  Loader2,
  Headphones
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupportPage() {
  const { user } = useAuth();
  const userId = user?.$id;
  const userName = user?.name || "";
  const userEmail = user?.email || "";

  // States
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [primaryDevice, setPrimaryDevice] = useState<string>("No connected device");
  
  // Submission & Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Drag and Drop States
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch primary device for context card
  useEffect(() => {
    const fetchDevice = async () => {
      if (!userId) return;
      try {
        const dbId = AppwriteConfig.databaseId;
        const res = await databases.listDocuments(dbId, DEVICES_COLLECTION_ID, [
          Query.equal("user_id", userId),
          Query.limit(1)
        ]);
        if (res.documents.length > 0) {
          setPrimaryDevice(res.documents[0].device_name);
        }
      } catch (e) {
        console.error("Error fetching device for support context:", e);
      }
    };
    fetchDevice();
  }, [userId]);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Validate File (image/* only, max 5MB)
  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please attach an image only.");
      return false;
    }
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      toast.error("File is too large. Maximum size allowed is 5MB.");
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setAttachment(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setAttachment(file);
      }
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Ticket Form
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // 1. Client-side validations
    if (!category) {
      toast.error("Please select an issue category.");
      return;
    }
    if (message.length < 20) {
      toast.error("Detailed message must be at least 20 characters.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting support ticket...");

    try {
      const dbId = AppwriteConfig.databaseId;

      // 2. Create document in support_tickets collection
      await databases.createDocument(
        dbId,
        SUPPORT_TICKETS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: userId,
          full_name: userName, // Standard casing
          Full_name: userName, // Include exact prompt key case-sensitive fallback
          email: userEmail,
          category: category,
          message: message,
          attachment_image: attachment ? attachment.name : null, // Store filename for MVP
          submitted_at: new Date().toISOString()
        }
      );

      // 3. Reset form states on success
      setCategory("");
      setMessage("");
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      setSubmitSuccess(true);
      toast.success("Support ticket submitted!", { id: toastId });
    } catch (err: any) {
      console.error("Failed to submit support ticket:", err);
      setSubmitError("Failed to submit ticket. Please try again.");
      toast.error("Ticket submission failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col lg:flex-row gap-6 items-start max-w-6xl mx-auto">
        
        {/* LEFT COLUMN WIDGETS */}
        <div className="w-full lg:max-w-sm flex flex-col gap-6 shrink-0">
          
          {/* IMMEDIATE ASSISTANCE CARD */}
          <Card className="border-slate-800 bg-[#0b0f19] text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            {/* Soft background glows */}
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            
            <div className="space-y-6">
              {/* Card Header icon */}
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/15 shadow-inner">
                <Headphones className="h-5.5 w-5.5 text-blue-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold font-serif tracking-tight">Need Immediate Assistance?</h3>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  Our specialized technical team is here to help you resolve any issues regarding your telephony monitoring installation or data sync.
                </p>
              </div>

              {/* Account Context Panel */}
              <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 space-y-3.5">
                <div className="flex justify-between items-center text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                  <span>Account Context</span>
                  <span className="inline-flex items-center rounded bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400 border border-emerald-500/10">
                    Linked
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Account ID:</span>
                    <span className="text-slate-200 text-[10px]">{userId ? `CB-${userId.substring(0, 5).toUpperCase()}` : "Pending"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Logged in as:</span>
                    <span className="text-slate-200 truncate max-w-[160px]">{userName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dashboard Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connected Device:</span>
                    <span className="text-slate-200 truncate max-w-[140px]">{primaryDevice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service hours footer */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3 grid grid-cols-2 gap-4 text-center mt-4">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Response Time</span>
                <span className="text-white font-bold font-sans text-xs mt-1 block">12–24 Hours</span>
              </div>
              <div className="border-l border-white/[0.06] pl-4">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Availability</span>
                <span className="text-white font-bold font-sans text-xs mt-1 block truncate">Mon–Fri 6am–8pm GMT</span>
              </div>
            </div>
          </Card>

          {/* QUICK SUPPORT TOPICS CARD */}
          <Card className="border-slate-100 rounded-3xl bg-white p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold font-serif text-slate-900">Quick Support Topics</h4>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Select commonly queried resources</p>
            </div>

            {/* Pill Tags */}
            <div className="flex flex-wrap gap-2 pt-1 select-none">
              {["APK Installation", "SMS Sync Issues", "Call Monitoring", "Notification Problems", "Device Permissions"].map(tag => (
                <span key={tag} className="inline-flex items-center rounded-full bg-[#EEF0FD]/60 border border-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 font-sans hover:bg-[#EEF0FD] transition cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>

            <Separator className="bg-slate-100" />

            {/* FAQs button */}
            <Button
              variant="outline"
              onClick={() => {
                toast.success("Simulation: Opening CallBridge FAQs Database...");
              }}
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-2xl font-semibold font-serif h-12 transition flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4.5 w-4.5 text-[#005EA1]" />
                <span>View Dashboard FAQs</span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
            </Button>
          </Card>

        </div>

        {/* RIGHT COLUMN TICKETING FORM / SUCCESS SCREEN */}
        <Card className="flex-1 w-full border-slate-100 rounded-3xl bg-white overflow-hidden p-6 sm:p-8 min-h-[520px] flex flex-col justify-between">
          
          {submitSuccess ? (
            // SUCCESS SCREEN OVERLAY
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-200 space-y-6 max-w-md mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/5 animate-bounce">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-serif tracking-tight text-slate-900">
                  Ticket Submitted Successfully
                </h3>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                  Your ticket has been submitted. We'll get back to you soon.
                </p>
              </div>

              <Button
                onClick={() => setSubmitSuccess(false)}
                className="h-12 bg-gradient-to-r from-[#060810] to-[#2B78BF] hover:opacity-95 text-white rounded-full font-serif font-semibold transition px-6 shadow-md w-full"
              >
                Submit Another Ticket
              </Button>
            </div>
          ) : (
            // TICKETING FORM
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold font-serif text-slate-900">Submit a Support Request</h3>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed mt-1">
                    Complete the form below and our technical team will review your system logs automatically.
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  {/* Account detail fields prefilled inside a single light-gray box */}
                  <div className="bg-[#F5F7FA] border border-slate-100/85 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold font-serif text-[#005EA1]">Full Name</label>
                        <input
                          type="text"
                          value={userName}
                          className="h-11 w-full rounded-xl bg-white px-4 text-sm font-medium text-slate-700 border border-slate-200/80 focus:outline-none cursor-not-allowed select-none"
                          disabled={true}
                          readOnly={true}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold font-serif text-[#005EA1]">Email Address</label>
                        <input
                          type="email"
                          value={userEmail}
                          className="h-11 w-full rounded-xl bg-white px-4 text-sm font-medium text-slate-700 border border-slate-200/80 focus:outline-none cursor-not-allowed select-none"
                          disabled={true}
                          readOnly={true}
                        />
                      </div>
                    </div>

                    {/* Account ID prefilled */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold font-serif text-[#005EA1]">Account ID</label>
                      <input
                        type="text"
                        value={userId ? `CB-${userId.substring(0, 5).toUpperCase()}-X99` : ""}
                        className="h-11 w-full rounded-xl bg-white px-4 text-sm font-medium text-slate-700 border border-slate-200/80 focus:outline-none cursor-not-allowed select-none"
                        disabled={true}
                        readOnly={true}
                      />
                    </div>
                  </div>

                  {/* Issue Category Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-serif text-[#005EA1]">Issue Category</label>
                    <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                      <SelectTrigger className="h-12 w-full rounded-xl bg-white px-4 text-sm font-medium font-serif text-slate-850 border border-slate-200 focus:outline-none transition-all cursor-pointer select-none">
                        <SelectValue placeholder="Select Issue Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-xl shadow-lg">
                        <SelectItem value="Technical Bug">Technical Bug</SelectItem>
                        <SelectItem value="Account Problem">Account Problem</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detailed Message Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold font-serif text-[#005EA1]">Detailed Message</label>
                      <span className={`text-[9px] font-bold ${message.length >= 20 ? "text-emerald-500" : "text-slate-400"}`}>
                        {message.length} / Min 20 chars
                      </span>
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe the issue in detail, including steps to reproduce if applicable..."
                      rows={5}
                      className="w-full rounded-xl bg-white p-4 text-sm font-normal font-serif text-slate-900 placeholder-slate-400 border border-slate-200 focus:outline-none focus:border-[#005EA1] transition-all resize-none leading-relaxed"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Attachments Upload area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold font-serif text-[#005EA1]">Attachments (Screenshots/Logs)</label>
                    
                    {attachment ? (
                      // File Selected State
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-4 select-none">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileImage className="h-8 w-8 text-blue-500 shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{attachment.name}</div>
                            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {(attachment.size / (1024 * 1024)).toFixed(2)} MB · Ready to attach
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAttachment}
                          className="h-8 w-8 rounded-full hover:bg-slate-250 border border-slate-200 bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center transition focus:outline-none shrink-0"
                          disabled={isSubmitting}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      // Drag & Drop Area
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 select-none ${
                          isDragging 
                            ? "border-blue-500 bg-blue-50/20" 
                            : "border-slate-200 hover:bg-slate-50/50 bg-white"
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                          disabled={isSubmitting}
                        />
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50/60 border border-indigo-100 text-indigo-600">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold font-serif text-slate-800">Drag and drop files here</div>
                          <div className="text-[9px] font-semibold text-slate-400 mt-1">
                            Support formats: PNG, JPG, PDF, TXT (Max 10MB)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Notification Banner */}
                  {submitError && (
                    <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-semibold text-rose-700 mt-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  {/* Form Submission Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !category || message.length < 20}
                      className="h-12 w-full bg-gradient-to-r from-[#060810] to-[#2B78BF] hover:opacity-95 disabled:opacity-50 text-white rounded-full font-serif font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/10"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Support Request</span>
                          <Send className="h-4 w-4 shrink-0" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </Card>

      </div>
    </PageLayout>
  );
}
