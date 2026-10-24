"use client";

import * as React from "react";
import Link from "next/link";
import {
  Save,
  Upload,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Eye,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowLeft,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Type,
  ListOrdered,
  Mail,
  Sliders,
  MoveRight,
  MoveLeft,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ArrowLeftRight,
  Download,
  FolderUp,
  X,
  Lock,
  Key,
  EyeOff,
  LogOut,
  ShieldCheck,
  User,
  Star,
  Check,
  Cloud,
  Globe,
  Tag,
  Clock,
  FolderOpen,
  Wand2,
  Play,
  ToggleLeft,
  ToggleRight,
  LayoutTemplate,
  HelpCircle,
  MessageSquareQuote,
  BarChart3,
  Grid3X3,
  Film,
  Settings2,
  Zap,
  Shield,
  Activity,
  Award,
  Compass,
  KeyRound,
  UserCheck,
  ShieldAlert,
  UserPlus,
  Fingerprint,
  MailQuestion
} from "lucide-react";
import { useSiteContent } from "@/lib/content-context";
import { DEFAULT_PAGES_DATA } from "@/lib/default-pages-data";
import {
  ShowcaseCardItem,
  ProjectDetail,
  ProcessStep,
  ParallaxItem,
  SocialLink,
  SiteData,
  CustomSection,
  CustomSectionItem,
  SectionTemplateType,
  AnimationPreset,
  CustomPage,
  PageBlock,
  AdminUser,
  SecuritySettings
} from "@/lib/site-types";

interface MediaPickerTarget {
  type: "parallax" | "process" | "project-cover" | "project-gallery" | "custom-section-item" | "custom-page-cover" | "custom-page-item";
  index?: number;
  sectionId?: string;
  itemIndex?: number;
  blockIndex?: number;
}

export default function AdminPage() {
  const {
    data,
    setData,
    saveChanges,
    resetToDefaults,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
  } = useSiteContent();

  // 2FA Fortress Authentication State
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<{ email: string; role: string } | null>(null);
  const [totalAccounts, setTotalAccounts] = React.useState<number>(0);
  const [isRegistrationLocked, setIsRegistrationLocked] = React.useState(false);
  const [accountsList, setAccountsList] = React.useState<AdminUser[]>([]);

  // Auth Form State (Login Only)
  const [authStep, setAuthStep] = React.useState<"credentials" | "otp">("credentials");
  const [authEmail, setAuthEmail] = React.useState("");
  const [authPassword, setAuthPassword] = React.useState("");
  const [authOtp, setAuthOtp] = React.useState("");
  const [activeOtpCode, setActiveOtpCode] = React.useState<string | null>(null);
  const [otpTimer, setOtpTimer] = React.useState<number>(0);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // 15-minute Security Lockout State (Triggered after 3 failed attempts)
  const [lockoutUntil, setLockoutUntil] = React.useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = React.useState<number>(0);

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // Security Tab Change Password State
  const [newPasswordEmail, setNewPasswordEmail] = React.useState("");
  const [newPasswordInput, setNewPasswordInput] = React.useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);

  // Real Email / SMTP Settings State
  const [hasSmtp, setHasSmtp] = React.useState(false);
  const [smtpService, setSmtpService] = React.useState("gmail");
  const [smtpUser, setSmtpUser] = React.useState("");
  const [smtpPass, setSmtpPass] = React.useState("");
  const [smtpFromName, setSmtpFromName] = React.useState("Studio Security");
  const [isSavingSmtp, setIsSavingSmtp] = React.useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = React.useState(false);
  const [emailDeliveredLive, setEmailDeliveredLive] = React.useState<boolean | null>(null);

  // ImgBB Cloud API Key state
  const [imgbbKeyInput, setImgbbKeyInput] = React.useState("");
  const [isSavingKey, setIsSavingKey] = React.useState(false);

  type AdminTab =
    | "hero"
    | "showcase"
    | "parallax"
    | "process"
    | "sections"
    | "pages"
    | "brand"
    | "preloader"
    | "philosophy"
    | "contact"
    | "media"
    | "security"
    | "backup";

  const [activeTab, setActiveTabState] = React.useState<AdminTab>("showcase");

  // Custom Page Editor Drawer / Modal state
  const [editingPage, setEditingPage] = React.useState<CustomPage | null>(null);
  const [isCreatingPage, setIsCreatingPage] = React.useState(false);

  React.useEffect(() => {
    try {
      const savedTab = localStorage.getItem("portfolio_admin_active_tab") as AdminTab | null;
      if (savedTab) {
        setActiveTabState(savedTab);
      }
      const savedLockout = localStorage.getItem("portfolio_admin_lockout_until");
      if (savedLockout) {
        const until = parseInt(savedLockout, 10);
        if (until > Date.now()) {
          setLockoutUntil(until);
          setLockoutRemaining(Math.ceil((until - Date.now()) / 1000));
        } else {
          localStorage.removeItem("portfolio_admin_lockout_until");
        }
      }
    } catch {}
  }, []);

  const setActiveTab = React.useCallback((tab: AdminTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem("portfolio_admin_active_tab", tab);
    } catch {}
  }, []);

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [toastType, setToastType] = React.useState<"success" | "error">("success");

  // Media Library state
  const [cloudFiles, setCloudFiles] = React.useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);
  const [stockFiles, setStockFiles] = React.useState<string[]>([]);
  const [hasImgbbKey, setHasImgbbKey] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  // Reusable Image Picker Modal state
  const [mediaPickerTarget, setMediaPickerTarget] = React.useState<MediaPickerTarget | null>(null);
  const [quickAssignUrl, setQuickAssignUrl] = React.useState<string | null>(null);

  // Project Modal / Drawer state
  const [editingProject, setEditingProject] = React.useState<ProjectDetail | null>(null);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);
  const [projectPlacement, setProjectPlacement] = React.useState<"row1" | "row2" | "none">("row1");
  const [newToolInput, setNewToolInput] = React.useState("");
  const [isModalUploading, setIsModalUploading] = React.useState(false);

  React.useEffect(() => {
    if (data?.cloudStorage?.imgbbApiKey) {
      setImgbbKeyInput(data.cloudStorage.imgbbApiKey);
      setHasImgbbKey(true);
    }
  }, [data]);

  // Check Auth & Account Status on mount
  const checkAuthStatus = React.useCallback(async () => {
    try {
      setIsAuthChecking(true);
      const res = await fetch("/api/auth");
      const json = await res.json();
      if (json.isAuthenticated && json.currentUser) {
        setIsAuthenticated(true);
        setCurrentUser(json.currentUser);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      const count = json.totalAccounts || 0;
      const locked = Boolean(json.isRegistrationLocked || count >= 2);
      setTotalAccounts(count);
      setIsRegistrationLocked(locked);
      setHasSmtp(Boolean(json.hasSmtpConfigured));
      if (json.smtpConfig) {
        setSmtpUser(json.smtpConfig.user || "");
        setSmtpService(json.smtpConfig.service || "gmail");
        setSmtpFromName(json.smtpConfig.fromName || "Studio Security");
      }
      if (json.accountsSummary) {
        setAccountsList(json.accountsSummary);
      }

      if (json.clientLockout?.locked && json.clientLockout.lockedUntil) {
        setLockoutUntil(json.clientLockout.lockedUntil);
        setLockoutRemaining(Math.max(1, Math.ceil((json.clientLockout.lockedUntil - Date.now()) / 1000)));
        try {
          localStorage.setItem("portfolio_admin_lockout_until", String(json.clientLockout.lockedUntil));
        } catch {}
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  React.useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Lockout countdown timer (15 minutes)
  React.useEffect(() => {
    if (lockoutRemaining <= 0) {
      if (lockoutUntil) {
        setLockoutUntil(null);
        try {
          localStorage.removeItem("portfolio_admin_lockout_until");
        } catch {}
        setAuthError(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setLockoutUntil(null);
          try {
            localStorage.removeItem("portfolio_admin_lockout_until");
          } catch {}
          setAuthError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutRemaining, lockoutUntil]);

  // Timer countdown for OTP
  React.useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // STEP 1: Request 2FA OTP for Login
  const handleRequestAuthOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setIsSubmittingAuth(true);
    setAuthError(null);

    try {
      if (!authEmail.trim() || !authEmail.includes("@")) {
        setAuthError("Please enter a valid Gmail / Email address.");
        setIsSubmittingAuth(false);
        return;
      }

      if (!authPassword || authPassword.length < 6) {
        setAuthError("Password must be at least 6 characters long.");
        setIsSubmittingAuth(false);
        return;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_otp",
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        }),
      });

      const resData = await res.json();

      if (res.status === 429 || resData.lockedUntil) {
        const until = resData.lockedUntil || Date.now() + (resData.remainingSeconds || 15 * 60) * 1000;
        const secs = resData.remainingSeconds || Math.max(1, Math.ceil((until - Date.now()) / 1000));
        setLockoutUntil(until);
        setLockoutRemaining(secs);
        try {
          localStorage.setItem("portfolio_admin_lockout_until", String(until));
        } catch {}
        setAuthError(resData.error || "Security Lockout: 3 failed attempts. Please wait 15 minutes.");
        return;
      }

      if (res.ok && resData.success) {
        setAuthStep("otp");
        setEmailDeliveredLive(Boolean(resData.emailDelivered));
        setActiveOtpCode(resData.otpPreview || null);
        setOtpTimer(300); // 5 minutes
        showToast(resData.message || "2FA Code generated! Enter 6-digit OTP.", "success");
      } else {
        setAuthError(resData.error || resData.message || "Authentication failed.");
      }
    } catch {
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_smtp",
          smtpSettings: {
            service: smtpService,
            user: smtpUser,
            pass: smtpPass,
            fromName: smtpFromName,
          },
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("Email SMTP configuration saved successfully!", "success");
        setHasSmtp(true);
        await checkAuthStatus();
      } else {
        showToast(resData.error || "Failed to save SMTP settings", "error");
      }
    } catch {
      showToast("Error saving SMTP settings", "error");
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_smtp",
          email: currentUser?.email,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast(resData.message || "Test email sent to your inbox!", "success");
      } else {
        showToast(resData.error || "Failed to deliver test email.", "error");
      }
    } catch {
      showToast("Error communicating with SMTP server.", "error");
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // STEP 2: Verify 6-Digit OTP Code
  const handleVerifyAuthOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setIsSubmittingAuth(true);
    setAuthError(null);

    try {
      if (!authOtp.trim() || authOtp.trim().length !== 6) {
        setAuthError("Please enter the complete 6-digit OTP code.");
        setIsSubmittingAuth(false);
        return;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          email: authEmail.trim().toLowerCase(),
          otp: authOtp.trim(),
        }),
      });

      const resData = await res.json();

      if (res.status === 429 || resData.lockedUntil) {
        const until = resData.lockedUntil || Date.now() + (resData.remainingSeconds || 15 * 60) * 1000;
        const secs = resData.remainingSeconds || Math.max(1, Math.ceil((until - Date.now()) / 1000));
        setLockoutUntil(until);
        setLockoutRemaining(secs);
        try {
          localStorage.setItem("portfolio_admin_lockout_until", String(until));
        } catch {}
        setAuthStep("credentials");
        setAuthError(resData.error || "Security Lockout: 3 failed attempts. Please wait 15 minutes.");
        return;
      }

      if (res.ok && resData.success) {
        setIsAuthenticated(true);
        setCurrentUser(resData.user);
        setAuthStep("credentials");
        setAuthOtp("");
        setActiveOtpCode(null);
        setLockoutUntil(null);
        setLockoutRemaining(0);
        try {
          localStorage.removeItem("portfolio_admin_lockout_until");
        } catch {}
        showToast("Fortress 2FA Verified! Welcome to Admin Studio.", "success");
        await checkAuthStatus();
      } else {
        setAuthError(resData.error || "Invalid or expired OTP code.");
      }
    } catch {
      setAuthError("Authentication verification error.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthStep("credentials");
    setAuthEmail("");
    setAuthPassword("");
    setAuthOtp("");
    showToast("Admin session revoked. System locked.", "success");
    await checkAuthStatus();
  };

  const handleDeleteAdminAccount = async (accountId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete admin account "${email}"?`)) return;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_account", accountId, email }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("Admin account deleted successfully!", "success");
        await checkAuthStatus();
      } else {
        showToast(resData.error || "Failed to delete account.", "error");
      }
    } catch {
      showToast("Server communication error.", "error");
    }
  };

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const targetEmail = newPasswordEmail || currentUser?.email;
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          email: targetEmail,
          newPassword: newPasswordInput,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast("Admin password updated successfully!", "success");
        setNewPasswordInput("");
        setNewPasswordEmail("");
      } else {
        showToast(resData.error || "Failed to update password.", "error");
      }
    } catch {
      showToast("Failed to communicate with server.", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const loadMedia = React.useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      if (res.ok) {
        const json = await res.json();
        setCloudFiles(json.cloud || []);
        setUploadedFiles(json.uploads || []);
        setStockFiles(json.stock || []);
        setHasImgbbKey(json.hasImgbbKey || false);
      }
    } catch (e) {
      console.error("Failed to load media files", e);
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      loadMedia();
    }
  }, [isAuthenticated, loadMedia]);

  const handleSaveImgbbKey = async () => {
    setIsSavingKey(true);
    try {
      setData((prev) => ({
        ...prev,
        cloudStorage: {
          ...prev.cloudStorage,
          provider: "imgbb",
          imgbbApiKey: imgbbKeyInput.trim(),
        },
      }));
      setHasImgbbKey(Boolean(imgbbKeyInput.trim()));
      showToast("ImgBB Cloud Storage API key saved! Click 'Save & Publish' to persist.", "success");
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleSave = async () => {
    const success = await saveChanges();
    if (success) {
      showToast("All changes published live successfully!", "success");
    } else {
      showToast("Failed to save changes. Please try again.", "error");
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data]);

  const uploadSingleFileToCloud = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (imgbbKeyInput.trim()) {
        formData.append("imgbbApiKey", imgbbKeyInput.trim());
      }
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const json = await res.json();
        await loadMedia();
        return json.url;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: FileList | null = null;
    if ("dataTransfer" in e) {
      e.preventDefault();
      files = e.dataTransfer.files;
    } else if (e.target.files) {
      files = e.target.files;
    }

    if (!files || files.length === 0) return;

    setIsUploading(true);
    let lastUploadedUrl = "";

    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadSingleFileToCloud(files[i]);
        if (url) lastUploadedUrl = url;
      }
      showToast("Images uploaded to cloud storage successfully!", "success");
      return lastUploadedUrl;
    } catch (err) {
      console.error("Upload error", err);
      showToast("Upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Direct Upload handler for Parallax Layer
  const handleParallaxLayerUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    showToast(`Uploading image for Parallax Layer ${index + 1}...`, "success");
    const url = await uploadSingleFileToCloud(file);
    if (url) {
      const newArr = [...(data.parallaxImages || [])];
      newArr[index] = { ...newArr[index], src: url };
      setData((prev) => ({ ...prev, parallaxImages: newArr }));
      showToast(`Parallax Layer ${index + 1} updated to cloud image!`, "success");
    } else {
      showToast("Failed to upload image", "error");
    }
  };

  // Direct Upload handler for Process Step
  const handleProcessStepUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    showToast(`Uploading image for Step ${index + 1}...`, "success");
    const url = await uploadSingleFileToCloud(file);
    if (url) {
      const newSteps = [...(data.process?.steps || [])];
      newSteps[index] = { ...newSteps[index], image: url };
      setData((prev) => ({
        ...prev,
        process: { ...prev.process, steps: newSteps },
      }));
      showToast(`Step ${index + 1} image updated to cloud image!`, "success");
    } else {
      showToast("Failed to upload step image", "error");
    }
  };

  // Handle image selected from media picker
  const handleSelectImageForTarget = (url: string) => {
    if (!mediaPickerTarget) return;

    if (mediaPickerTarget.type === "parallax" && typeof mediaPickerTarget.index === "number") {
      const newArr = [...(data.parallaxImages || [])];
      newArr[mediaPickerTarget.index] = { ...newArr[mediaPickerTarget.index], src: url };
      setData((prev) => ({ ...prev, parallaxImages: newArr }));
      showToast(`Parallax Layer ${mediaPickerTarget.index + 1} updated!`, "success");
    } else if (mediaPickerTarget.type === "process" && typeof mediaPickerTarget.index === "number") {
      const newSteps = [...(data.process?.steps || [])];
      newSteps[mediaPickerTarget.index] = { ...newSteps[mediaPickerTarget.index], image: url };
      setData((prev) => ({
        ...prev,
        process: { ...prev.process, steps: newSteps },
      }));
      showToast(`Step ${mediaPickerTarget.index + 1} image updated!`, "success");
    } else if (mediaPickerTarget.type === "project-cover" && editingProject) {
      setEditingProject({ ...editingProject, imageSrc: url });
      showToast("Project cover image updated!", "success");
    } else if (mediaPickerTarget.type === "project-gallery" && editingProject) {
      setEditingProject({
        ...editingProject,
        secondaryImages: [...(editingProject.secondaryImages || []), url],
      });
      showToast("Added image to project gallery!", "success");
    } else if (
      mediaPickerTarget.type === "custom-section-item" &&
      mediaPickerTarget.sectionId &&
      typeof mediaPickerTarget.itemIndex === "number"
    ) {
      const secId = mediaPickerTarget.sectionId;
      const itmIdx = mediaPickerTarget.itemIndex;
      const updatedSecs = (data.customSections || []).map((sec) => {
        if (sec.id === secId) {
          const newItems = [...sec.items];
          if (newItems[itmIdx]) {
            newItems[itmIdx] = { ...newItems[itmIdx], image: url };
          }
          return { ...sec, items: newItems };
        }
        return sec;
      });
      const updated = { ...data, customSections: updatedSecs };
      setData(updated);
      saveChanges(updated);
      showToast("Custom section item image updated!", "success");
    } else if (mediaPickerTarget.type === "custom-page-cover" && editingPage) {
      setEditingPage({ ...editingPage, coverImage: url });
      showToast("Page cover image updated!", "success");
    } else if (
      mediaPickerTarget.type === "custom-page-item" &&
      editingPage &&
      typeof mediaPickerTarget.blockIndex === "number" &&
      typeof mediaPickerTarget.itemIndex === "number"
    ) {
      const bIdx = mediaPickerTarget.blockIndex;
      const itmIdx = mediaPickerTarget.itemIndex;
      const newBlocks = [...editingPage.blocks];
      if (newBlocks[bIdx] && newBlocks[bIdx].items && newBlocks[bIdx].items![itmIdx]) {
        const newItems = [...newBlocks[bIdx].items!];
        newItems[itmIdx] = { ...newItems[itmIdx], image: url };
        newBlocks[bIdx] = { ...newBlocks[bIdx], items: newItems };
        setEditingPage({ ...editingPage, blocks: newBlocks });
        showToast("Page item image updated!", "success");
      }
    }

    setMediaPickerTarget(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
    showToast(`Copied "${text}" to clipboard!`, "success");
  };

  const handleOpenProjectModal = (proj?: ProjectDetail) => {
    if (proj) {
      setEditingProject({
        ...proj,
        secondaryImages: proj.secondaryImages || [],
        tools: proj.tools || [],
      });
      setIsCreatingNew(false);

      const inRow1 = data.showcase?.row1?.some((item) => item.id === proj.id);
      const inRow2 = data.showcase?.row2?.some((item) => item.id === proj.id);
      if (inRow1) setProjectPlacement("row1");
      else if (inRow2) setProjectPlacement("row2");
      else setProjectPlacement("none");
    } else {
      const newId = `project-${Date.now().toString(36)}`;
      setEditingProject({
        id: newId,
        title: "NEW BRAND SHOWCASE",
        category: "Interactive & Brand System",
        year: new Date().getFullYear().toString(),
        url: "example-studio.design",
        imageSrc: cloudFiles[0] || uploadedFiles[0] || "/images2/27.jpg",
        secondaryImages: ["/images2/28.jpg", "/images2/29.jpg"],
        tag: "Branding",
        description: "A comprehensive brand identity and kinetic digital experience designed for high-impact presence.",
        challenge: "Developing a refined aesthetic identity that commands attention across digital and physical touchpoints.",
        solution: "Formulated bespoke visual typography, tactile packaging mockups, and modular interactive web layouts.",
        client: "Client Enterprise",
        role: "Lead Visual & Interactive Designer",
        tools: ["Brand Strategy", "Next.js", "Framer Motion", "Tailwind CSS"],
      });
      setIsCreatingNew(true);
      setProjectPlacement("row1");
    }
  };

  const handleProjectGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingProject) return;
    setIsModalUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadSingleFileToCloud(e.target.files[i]);
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        setEditingProject({
          ...editingProject,
          secondaryImages: [...(editingProject.secondaryImages || []), ...uploadedUrls],
        });
        showToast(`Added ${uploadedUrls.length} image(s) to project gallery!`, "success");
      }
    } catch {
      showToast("Failed to upload image to project", "error");
    } finally {
      setIsModalUploading(false);
    }
  };

  const handleProjectCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingProject) return;
    const file = e.target.files[0];
    const url = await uploadSingleFileToCloud(file);
    if (url) {
      setEditingProject({ ...editingProject, imageSrc: url });
      showToast("Primary cover image updated!", "success");
    } else {
      showToast("Cover upload failed", "error");
    }
  };

  const handleSaveProjectModal = async () => {
    if (!editingProject || !editingProject.id || !editingProject.title) {
      showToast("Please provide both project title and ID", "error");
      return;
    }

    const projectId = editingProject.id.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const formattedProject = { ...editingProject, id: projectId };

    const updatedProjects = {
      ...(data.projects || {}),
      [projectId]: formattedProject,
    };

    const cardItem: ShowcaseCardItem = {
      id: projectId,
      title: formattedProject.title,
      url: formattedProject.url || "",
      imageSrc: formattedProject.imageSrc,
      tag: formattedProject.tag || formattedProject.category || "Showcase",
    };

    let updatedRow1 = (data.showcase?.row1 || []).filter((i) => i.id !== projectId);
    let updatedRow2 = (data.showcase?.row2 || []).filter((i) => i.id !== projectId);

    if (projectPlacement === "row1") {
      updatedRow1 = [cardItem, ...updatedRow1];
    } else if (projectPlacement === "row2") {
      updatedRow2 = [cardItem, ...updatedRow2];
    }

    const updatedData: SiteData = {
      ...data,
      projects: updatedProjects,
      showcase: {
        ...data.showcase,
        row1: updatedRow1,
        row2: updatedRow2,
      },
    };

    setData(updatedData);
    setEditingProject(null);
    const saved = await saveChanges(updatedData);
    if (saved) {
      showToast(`Project "${formattedProject.title}" saved & published live!`, "success");
    } else {
      showToast(`Project "${formattedProject.title}" saved! Click Save & Publish to apply.`, "success");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm(`Are you sure you want to delete project "${id}"?`)) return;

    const updatedProjects = { ...(data.projects || {}) };
    delete updatedProjects[id];

    const updatedRow1 = (data.showcase?.row1 || []).filter((i) => i.id !== id);
    const updatedRow2 = (data.showcase?.row2 || []).filter((i) => i.id !== id);

    const updatedData: SiteData = {
      ...data,
      projects: updatedProjects,
      showcase: {
        ...data.showcase,
        row1: updatedRow1,
        row2: updatedRow2,
      },
    };

    setData(updatedData);
    const saved = await saveChanges(updatedData);
    if (saved) {
      showToast(`Project "${id}" deleted & published live!`, "success");
    } else {
      showToast(`Project "${id}" deleted`, "success");
    }
  };

  const handleQuickAssign = async (
    targetType: "parallax" | "process" | "project-cover" | "project-gallery",
    targetValue: number | string
  ) => {
    if (!quickAssignUrl) return;
    let updated = { ...data };

    if (targetType === "parallax" && typeof targetValue === "number") {
      const newParallax = [...(data.parallaxImages || [])];
      if (newParallax[targetValue]) {
        newParallax[targetValue] = { ...newParallax[targetValue], src: quickAssignUrl };
        updated = { ...updated, parallaxImages: newParallax };
        showToast(`Image assigned to Parallax Layer ${targetValue + 1}!`, "success");
      }
    } else if (targetType === "process" && typeof targetValue === "number") {
      const newSteps = [...(data.process?.steps || [])];
      if (newSteps[targetValue]) {
        newSteps[targetValue] = { ...newSteps[targetValue], image: quickAssignUrl };
        updated = { ...updated, process: { ...updated.process, steps: newSteps } };
        showToast(`Image assigned to Process Step ${targetValue + 1}!`, "success");
      }
    } else if (targetType === "project-cover" && typeof targetValue === "string") {
      const targetProj = data.projects?.[targetValue];
      if (targetProj) {
        const updatedProj = { ...targetProj, imageSrc: quickAssignUrl };
        const updatedProjects = { ...data.projects, [targetValue]: updatedProj };
        const updatedRow1 = (data.showcase?.row1 || []).map((c) =>
          c.id === targetValue ? { ...c, imageSrc: quickAssignUrl } : c
        );
        const updatedRow2 = (data.showcase?.row2 || []).map((c) =>
          c.id === targetValue ? { ...c, imageSrc: quickAssignUrl } : c
        );
        updated = {
          ...updated,
          projects: updatedProjects,
          showcase: { ...updated.showcase, row1: updatedRow1, row2: updatedRow2 },
        };
        showToast(`Cover image updated for "${targetProj.title}"!`, "success");
      }
    } else if (targetType === "project-gallery" && typeof targetValue === "string") {
      const targetProj = data.projects?.[targetValue];
      if (targetProj) {
        const updatedProj = {
          ...targetProj,
          secondaryImages: [...(targetProj.secondaryImages || []), quickAssignUrl],
        };
        const updatedProjects = { ...data.projects, [targetValue]: updatedProj };
        updated = { ...updated, projects: updatedProjects };
        showToast(`Added to gallery of "${targetProj.title}"!`, "success");
      }
    }

    setData(updated);
    await saveChanges(updated);
    setQuickAssignUrl(null);
  };

  const moveParallaxLayer = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= (data.parallaxImages || []).length) return;
    const newArr = [...(data.parallaxImages || [])];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    const updated = { ...data, parallaxImages: newArr };
    setData(updated);
    await saveChanges(updated);
    showToast(`Parallax layer moved ${direction}!`, "success");
  };

  const moveProcessStep = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= (data.process?.steps || []).length) return;
    const newSteps = [...(data.process?.steps || [])];
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    newSteps.forEach((s, idx) => {
      s.num = String(idx + 1).padStart(2, "0");
    });
    const updated = {
      ...data,
      process: { ...data.process, steps: newSteps },
    };
    setData(updated);
    await saveChanges(updated);
    showToast(`Process step order updated!`, "success");
  };

  const moveShowcaseCard = async (row: "row1" | "row2", index: number, direction: "left" | "right") => {
    const currentList = [...(data.showcase?.[row] || [])];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const temp = currentList[index];
    currentList[index] = currentList[targetIndex];
    currentList[targetIndex] = temp;
    const updated = {
      ...data,
      showcase: {
        ...data.showcase,
        [row]: currentList,
      },
    };
    setData(updated);
    await saveChanges(updated);
    showToast(`Marquee card moved ${direction}!`, "success");
  };

  const setProjectQuickPlacement = async (projectId: string, placement: "row1" | "row2" | "none") => {
    const proj = data.projects?.[projectId];
    if (!proj) return;

    let updatedRow1 = (data.showcase?.row1 || []).filter((i) => i.id !== projectId);
    let updatedRow2 = (data.showcase?.row2 || []).filter((i) => i.id !== projectId);

    const cardItem: ShowcaseCardItem = {
      id: projectId,
      title: proj.title,
      url: proj.url || "",
      imageSrc: proj.imageSrc,
      tag: proj.tag || proj.category || "Showcase",
    };

    if (placement === "row1") {
      updatedRow1 = [...updatedRow1, cardItem];
    } else if (placement === "row2") {
      updatedRow2 = [...updatedRow2, cardItem];
    }

    const updated = {
      ...data,
      showcase: {
        ...data.showcase,
        row1: updatedRow1,
        row2: updatedRow2,
      },
    };

    setData(updated);
    await saveChanges(updated);
    showToast(`Placement updated to ${placement === "none" ? "Case Study Only" : placement.toUpperCase()}!`, "success");
  };

  const handleCreateNewSection = async (type: SectionTemplateType) => {
    const newId = `sec-${Date.now().toString(36)}`;
    let initialSection: CustomSection;

    switch (type) {
      case "services":
        initialSection = {
          id: newId,
          type: "services",
          enabled: true,
          badge: "Services & Capabilities",
          title: "Systemic Brand & Digital Craft",
          subtitle: "Disciplined execution across identity, kinetic interfaces, and bespoke packaging.",
          animation: "3d-tilt",
          animationSpeed: 0.6,
          glowColor: "blue",
          items: [
            {
              id: "s1",
              title: "Identity Architecture",
              description: "Strategic visual frameworks, typography systems, and brand guidelines built for category authority.",
              tag: "Strategy",
              icon: "shield",
              details: ["Brand Positioning", "Typography Hierarchy", "Design Systems"],
            },
            {
              id: "s2",
              title: "Kinetic Web Experiences",
              description: "Interactive digital flagship websites built with bespoke animations, low-latency micro-interactions, and 3D scenes.",
              tag: "Digital",
              icon: "zap",
              details: ["Next.js & React", "GSAP & Framer Motion", "WebGL Shaders"],
            },
            {
              id: "s3",
              title: "Tactile Packaging Systems",
              description: "High-end structural packaging, foil stamping art direction, and sustainable tactile unboxing rituals.",
              tag: "Packaging",
              icon: "award",
              details: ["3D Box Prototyping", "Print Production", "Material Curation"],
            },
          ],
        };
        break;

      case "marquee-banner":
        initialSection = {
          id: newId,
          type: "marquee-banner",
          enabled: true,
          title: "KINETIC BRAND ARCHITECTURE",
          bannerText: "VISUAL SYSTEMS • HIGH-IMPACT EXPERIENCES • BESPOKE PACKAGING • KINETIC INTERACTION •",
          bannerSpeed: 20,
          animation: "fade-up",
          glowColor: "purple",
          items: [],
        };
        break;

      case "stats":
        initialSection = {
          id: newId,
          type: "stats",
          enabled: true,
          badge: "Impact & Scale",
          title: "Numbers That Define Our Discipline",
          subtitle: "A proven track record of elevated visual identity across enterprise & luxury sectors.",
          animation: "zoom-in",
          glowColor: "cyan",
          items: [
            { id: "st1", title: "Brands Built", value: "85+", description: "From inception to global rollout" },
            { id: "st2", title: "Industry Awards", value: "24", description: "Design excellence recognitions" },
            { id: "st3", title: "Client Retention", value: "98%", description: "Ongoing creative direction" },
            { id: "st4", title: "Countries Reached", value: "14", description: "Worldwide digital footprints" },
          ],
        };
        break;

      case "testimonials":
        initialSection = {
          id: newId,
          type: "testimonials",
          enabled: true,
          badge: "Testimonials & Trust",
          title: "What Leaders Say About Us",
          subtitle: "Trusted by forward-thinking founders, creative directors, and luxury enterprises.",
          animation: "blur-reveal",
          glowColor: "emerald",
          items: [
            {
              id: "t1",
              title: "Elena Rostova",
              subtitle: "Founder, Verdelle Organics",
              description: "The aesthetic discipline brought to our botanical brand transformed our presence from local boutique to international luxury standard.",
            },
            {
              id: "t2",
              title: "Marcus Vance",
              subtitle: "VP of Product, Lumina Labs",
              description: "Flawless kinetic execution. Their mastery of typography and interactive performance gave us a website our competitors constantly study.",
            },
          ],
        };
        break;

      case "faq":
        initialSection = {
          id: newId,
          type: "faq",
          enabled: true,
          badge: "Questions & Answers",
          title: "Frequently Asked Inquiries",
          subtitle: "Everything you need to know about our collaboration model and delivery timeline.",
          animation: "fade-up",
          glowColor: "none",
          items: [
            {
              id: "f1",
              title: "What is your typical project timeline?",
              description: "Comprehensive brand identity and web systems typically range between 4 to 8 weeks depending on scope, packaging complexity, and 3D requirements.",
            },
            {
              id: "f2",
              title: "Do you handle full development alongside design?",
              description: "Yes, we provide end-to-end engineering using Next.js, Framer Motion, and GSAP with zero template dependencies.",
            },
            {
              id: "f3",
              title: "How do we get started?",
              description: "Reach out via our inquiry form below or direct email. We schedule an introductory strategy session within 24 hours.",
            },
          ],
        };
        break;

      case "split-showcase":
        initialSection = {
          id: newId,
          type: "split-showcase",
          enabled: true,
          badge: "Deep Dive Architecture",
          title: "Precision in Every Dimension",
          subtitle: "Harmonizing digital performance with physical tactile quality.",
          animation: "kinetic-slide",
          glowColor: "blue",
          items: [
            {
              id: "sp1",
              title: "Handcrafted Typographic Systems",
              description: "Every letterform and kerning pair is tested across high-resolution print and retina screens.",
              image: "/images2/27.jpg",
            },
            {
              id: "sp2",
              title: "Dynamic Kinetic Micro-Interactions",
              description: "Smooth friction physics, interactive drag containers, and responsive camera parallax.",
            },
          ],
        };
        break;

      case "client-logos":
        initialSection = {
          id: newId,
          type: "client-logos",
          enabled: true,
          badge: "Partners & Clients",
          title: "Trusted by Modern Brands",
          subtitle: "Collaborating with visionaries across art, fashion, technology, and gastronomy.",
          animation: "fade-up",
          glowColor: "none",
          items: [
            { id: "l1", title: "STUDIO" },
            { id: "l2", title: "VERDELLE" },
            { id: "l3", title: "WILLOW & WHISK" },
            { id: "l4", title: "LUMINA LABS" },
            { id: "l5", title: "NATURA" },
            { id: "l6", title: "MR. MUG" },
          ],
        };
        break;

      case "pricing-table":
        initialSection = {
          id: newId,
          type: "pricing-table",
          enabled: true,
          badge: "Investment & Sprints",
          title: "Transparent Engagement Tiers",
          subtitle: "Disciplined scope models tailored for early-stage disruptors and scaling category leaders.",
          animation: "fade-up",
          glowColor: "blue",
          items: [
            {
              id: "pr1",
              title: "Identity Sprint",
              value: "$8,500",
              tag: "2-3 Weeks",
              description: "Core logo suite, typographic guidelines, color system, and high-impact design assets.",
              link: "/p/contact-booking",
            },
            {
              id: "pr2",
              title: "Flagship Web & 3D",
              value: "$18,000",
              tag: "4-6 Weeks",
              description: "Complete custom Next.js flagship web build, kinetic WebGL animations, and 3D product visuals.",
              link: "/p/contact-booking",
            },
            {
              id: "pr3",
              title: "Studio Retainer",
              value: "$6,500 / mo",
              tag: "Monthly",
              description: "Continuous creative direction, campaign drops, 3D simulations, and rapid iteration sprints.",
              link: "/p/contact-booking",
            },
          ],
        };
        break;

      case "tech-stack":
        initialSection = {
          id: newId,
          type: "tech-stack",
          enabled: true,
          badge: "Engineering & Craft",
          title: "Modern Interactive Stack",
          subtitle: "State-of-the-art frontend frameworks, physics engines, and creative coding pipelines.",
          animation: "3d-tilt",
          glowColor: "cyan",
          items: [
            { id: "ts1", title: "Next.js 16", tag: "Framework", description: "Turbopack, App Router & edge rendering." },
            { id: "ts2", title: "Three.js / WebGL", tag: "3D Graphics", description: "GLSL fragment shaders & lighting." },
            { id: "ts3", title: "Framer Motion", tag: "Kinetic UI", description: "60 FPS spring physics & gestures." },
            { id: "ts4", title: "Tailwind / CSS", tag: "Design System", description: "Hardware-accelerated CSS styling." },
            { id: "ts5", title: "GSAP ScrollTrigger", tag: "Parallax", description: "Complex timeline choreography." },
            { id: "ts6", title: "TypeScript", tag: "Type Safety", description: "Strictly typed robust application logic." },
          ],
        };
        break;

      case "awards-rack":
        initialSection = {
          id: newId,
          type: "awards-rack",
          enabled: true,
          badge: "Accolades",
          title: "Trophy Case & Honors",
          subtitle: "Recognized internationally by leading design authorities.",
          animation: "blur-reveal",
          glowColor: "none",
          items: [
            { id: "aw1", title: "Awwwards Site of the Day", subtitle: "Lumina Labs Flagship", tag: "Awwwards", value: "2025" },
            { id: "aw2", title: "D&AD Wood Pencil", subtitle: "Verdelle Packaging System", tag: "D&AD", value: "2024" },
            { id: "aw3", title: "FWA of the Month", subtitle: "Spatial Experience", tag: "FWA", value: "2024" },
            { id: "aw4", title: "Type Directors Club TDC70", subtitle: "Custom Foundry Letterforms", tag: "TDC", value: "2023" },
          ],
        };
        break;

      case "comparison-slider":
        initialSection = {
          id: newId,
          type: "comparison-slider",
          enabled: true,
          badge: "Transformation",
          title: "Before & After Metamorphosis",
          subtitle: "Witness how our architectural design principles elevate commodity into category leadership.",
          animation: "kinetic-slide",
          glowColor: "purple",
          items: [
            {
              id: "cp1",
              title: "Raw Wireframe & Spatial Architecture",
              tag: "Stage 01: Strategy",
              description: "Rigorous wireframe grid establishing visual hierarchy and spatial rhythm.",
              image: "/images2/28.jpg",
            },
            {
              id: "cp2",
              title: "Polished Kinetic Flagship Masterpiece",
              tag: "Stage 02: Final Craft",
              description: "Hyper-refined typography, ambient lighting, and fluid interactive physics.",
              image: "/images2/27.jpg",
            },
          ],
        };
        break;

      case "video-reel":
        initialSection = {
          id: newId,
          type: "video-reel",
          enabled: true,
          badge: "Motion Reel",
          title: "2026 Kinetic Showcase Reel",
          subtitle: "A compilation of our finest CGI simulations, interactive websites, and brand launch films.",
          animation: "zoom-in",
          glowColor: "blue",
          items: [
            {
              id: "vr1",
              title: "Watch 2026 Studio Reel (60 FPS)",
              description: "Click to experience our high-definition motion showcase.",
              image: "/images2/29.jpg",
            },
          ],
        };
        break;

      case "team-grid":
        initialSection = {
          id: newId,
          type: "team-grid",
          enabled: true,
          badge: "The Collective",
          title: "Leadership & Creative Directors",
          subtitle: "A boutique guild of obsessive designers, engineers, and creative directors.",
          animation: "fade-up",
          glowColor: "none",
          items: [
            { id: "tm1", title: "Avadh Kheni", subtitle: "Founder & Lead Director", description: "Brand architecture, digital flagships, and spatial motion.", image: "/images2/27.jpg" },
            { id: "tm2", title: "Elena Vance", subtitle: "Design Systems & Type", description: "Bespoke variable fonts, token systems, and layout rhythm.", image: "/images2/28.jpg" },
            { id: "tm3", title: "Julian Croft", subtitle: "Creative Frontend Engineer", description: "WebGL shaders, Next.js optimization, and physics engines.", image: "/images2/29.jpg" },
            { id: "tm4", title: "Sophia Thorne", subtitle: "3D Motion & CGI Artist", description: "Photorealistic lighting, soft-body simulations, and launch films.", image: "/images2/30.jpg" },
          ],
        };
        break;

      case "timeline-roadmap":
        initialSection = {
          id: newId,
          type: "timeline-roadmap",
          enabled: true,
          badge: "Evolution",
          title: "Studio Journey & Milestones",
          subtitle: "From a single-desk laboratory to designing for category leaders worldwide.",
          animation: "fade-up",
          glowColor: "cyan",
          items: [
            { id: "tr1", title: "2020: Foundry Inception", tag: "Milestone", description: "Established our boutique studio focusing purely on luxury visual identity." },
            { id: "tr2", title: "2022: WebGL & Kinetic Expansion", tag: "Innovation", description: "Integrated custom real-time 3D and shader pipelines into our web flagships." },
            { id: "tr3", title: "2024: International Acclaim", tag: "D&AD / Awwwards", description: "Awarded Site of the Year and Graphite Pencil honors." },
            { id: "tr4", title: "2026: The Next Era", tag: "Now", description: "Expanding into physical tactile packaging labs and spatial computing." },
          ],
        };
        break;

      case "journal-preview":
        initialSection = {
          id: newId,
          type: "journal-preview",
          enabled: true,
          badge: "Editorial",
          title: "Latest Essays & Insights",
          subtitle: "Perspectives on modern brand architecture, spatial physics, and typography.",
          animation: "fade-up",
          glowColor: "none",
          items: [
            { id: "jp1", title: "The Death of Generic Flat Design", tag: "Design Essay", description: "Why tactile materiality and kinetic weight are reclaiming the digital web.", image: "/images2/27.jpg" },
            { id: "jp2", title: "Engineering 60 FPS Micro-Interactions", tag: "Technical", description: "Deep dive into spring physics, composite layers, and browser rendering.", image: "/images2/28.jpg" },
            { id: "jp3", title: "Why Custom Letterforms Build Moats", tag: "Strategy", description: "How proprietary logotypes instantly command higher category positioning.", image: "/images2/29.jpg" },
          ],
        };
        break;

      case "press-mentions":
        initialSection = {
          id: newId,
          type: "press-mentions",
          enabled: true,
          badge: "In The News",
          title: "Press & Media Recognition",
          subtitle: "Featured in leading global publications for excellence in creative direction.",
          animation: "fade-up",
          glowColor: "none",
          items: [
            { id: "pm1", title: "A masterclass in restraint, typography, and interactive motion.", tag: "WIRED" },
            { id: "pm2", title: "Redefining what a modern digital flagship should feel like.", tag: "FAST COMPANY" },
            { id: "pm3", title: "The studio building the most coveted aesthetic identities of this decade.", tag: "VOGUE DESIGN" },
          ],
        };
        break;

      case "audio-player":
      default:
        initialSection = {
          id: newId,
          type: "audio-player",
          enabled: true,
          badge: "Sonic Experience",
          title: "Studio Ambient Soundtrack (Deep Focus)",
          subtitle: "Immerse yourself in our generative soundscape designed for deep creative immersion.",
          animation: "blur-reveal",
          glowColor: "purple",
          items: [
            { id: "ap1", title: "Track 01: Obsidian Resonance", tag: "128 BPM", description: "Ambient minimal synth soundscape." },
          ],
        };
        break;
    }

    const updatedSections = [...(data.customSections || []), initialSection];
    const updatedData = { ...data, customSections: updatedSections };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast(`New ${type.toUpperCase()} section added & published live!`, "success");
  };

  const handleDeleteCustomSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this custom section?")) return;
    const updatedSections = (data.customSections || []).filter((s) => s.id !== sectionId);
    const updatedData = { ...data, customSections: updatedSections };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast("Section deleted!", "success");
  };

  const handleToggleCustomSection = async (sectionId: string) => {
    const updatedSections = (data.customSections || []).map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    const updatedData = { ...data, customSections: updatedSections };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast("Section visibility updated!", "success");
  };

  const handleMoveCustomSection = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const currentList = [...(data.customSections || [])];
    if (targetIdx < 0 || targetIdx >= currentList.length) return;
    const temp = currentList[index];
    currentList[index] = currentList[targetIdx];
    currentList[targetIdx] = temp;
    const updatedData = { ...data, customSections: currentList };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast(`Section moved ${direction}!`, "success");
  };

  const handleUpdateSection = async (sectionId: string, updatedFields: Partial<CustomSection>) => {
    const updatedSections = (data.customSections || []).map((s) =>
      s.id === sectionId ? { ...s, ...updatedFields } : s
    );
    const updatedData = { ...data, customSections: updatedSections };
    setData(updatedData);
    await saveChanges(updatedData);
  };

  const handleAddItemToSection = async (sectionId: string) => {
    const updatedSections = (data.customSections || []).map((s) => {
      if (s.id === sectionId) {
        const newItem: CustomSectionItem = {
          id: `item-${Date.now().toString(36)}`,
          title: "New Item Title",
          description: "Description of the feature or deliverable.",
          tag: "Featured",
          icon: "sparkles",
          details: ["Deliverable 1", "Deliverable 2"],
        };
        return { ...s, items: [...s.items, newItem] };
      }
      return s;
    });
    const updatedData = { ...data, customSections: updatedSections };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast("Added item to section!", "success");
  };

  const handleDeleteItemFromSection = async (sectionId: string, itemIdx: number) => {
    const updatedSections = (data.customSections || []).map((s) => {
      if (s.id === sectionId) {
        return { ...s, items: s.items.filter((_, idx) => idx !== itemIdx) };
      }
      return s;
    });
    const updatedData = { ...data, customSections: updatedSections };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast("Item deleted!", "success");
  };

  const handleUpdateSectionItem = (
    sectionId: string,
    itemIdx: number,
    field: keyof CustomSectionItem,
    value: any
  ) => {
    const updatedSections = (data.customSections || []).map((s) => {
      if (s.id === sectionId) {
        const newItems = [...s.items];
        if (newItems[itemIdx]) {
          newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
        }
        return { ...s, items: newItems };
      }
      return s;
    });
    setData((prev) => ({ ...prev, customSections: updatedSections }));
  };

  const [templateCategoryFilter, setTemplateCategoryFilter] = React.useState<string>("all");

  const activePages = React.useMemo(() => {
    return Object.values(data?.customPages || {});
  }, [data?.customPages]);

  const templatePages = React.useMemo(() => {
    return Object.values(DEFAULT_PAGES_DATA);
  }, []);

  const filteredTemplates = React.useMemo(() => {
    if (templateCategoryFilter === "all") return templatePages;
    return templatePages.filter((t) => t.category === templateCategoryFilter);
  }, [templatePages, templateCategoryFilter]);

  const handleUseTemplate = (template: CustomPage) => {
    const newPage: CustomPage = {
      ...JSON.parse(JSON.stringify(template)),
      isPublished: true,
    };
    setEditingPage(newPage);
    setIsCreatingPage(true);
    showToast(`Loaded "${template.title}" template into editor! Customize and save to publish.`, "success");
  };

  const handleCreateNewPage = () => {
    const newSlug = `page-${Date.now().toString(36)}`;
    const newPage: CustomPage = {
      slug: newSlug,
      title: "NEW STUDIO SUBPAGE",
      subtitle: "A bespoke dedicated narrative crafted for high-impact presence.",
      badge: "Special Release",
      coverImage: cloudFiles[0] || uploadedFiles[0] || "/images2/27.jpg",
      category: "studio",
      variant: "standard-editorial",
      metaDescription: "Dedicated subpage describing bespoke capabilities.",
      featuredInNav: true,
      isPublished: true,
      blocks: [
        {
          id: "b1",
          type: "text",
          title: "The Vision & Architecture",
          badge: "Overview",
          content: "Articulate your narrative, philosophy, or specific project methodology here with full editorial formatting.",
        },
        {
          id: "b2",
          type: "grid",
          title: "Key Highlights & Deliverables",
          badge: "Disciplines",
          items: [
            { title: "Bespoke Typography", description: "Custom letterforms and layout hierarchy.", tag: "Identity" },
            { title: "Kinetic Micro-Interactions", description: "Smooth 60 FPS transitions and spatial physics.", tag: "Digital" },
          ],
        },
        {
          id: "b3",
          type: "cta",
          title: "Elevate your brand's presence today.",
          subtitle: "Schedule a creative discovery consultation with our studio.",
          ctaText: "Inquire Now",
          ctaLink: "/p/contact-booking",
        },
      ],
    };
    setEditingPage(newPage);
    setIsCreatingPage(true);
  };

  const handleSavePageModal = async () => {
    if (!editingPage || !editingPage.slug.trim()) {
      showToast("Page slug is required!", "error");
      return;
    }
    const cleanSlug = editingPage.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const pageToSave = { ...editingPage, slug: cleanSlug, isPublished: true };
    const updatedPages = {
      ...(data.customPages || {}),
      [cleanSlug]: pageToSave,
    };
    const updatedData = { ...data, customPages: updatedPages };
    setData(updatedData);
    await saveChanges(updatedData);
    setEditingPage(null);
    setIsCreatingPage(false);
    showToast(`Page "/p/${cleanSlug}" saved and published live!`, "success");
  };

  const handleDeletePage = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete custom page "/p/${slug}" from your live site?`)) return;
    const updatedPages = { ...(data.customPages || {}) };
    delete updatedPages[slug];
    const updatedData = { ...data, customPages: updatedPages };
    setData(updatedData);
    await saveChanges(updatedData);
    showToast(`Page "/p/${slug}" removed from live site!`, "success");
  };

  const handleAddBlockToEditingPage = (type: PageBlock["type"]) => {
    if (!editingPage) return;
    const newBlock: PageBlock = {
      id: `blk-${Date.now().toString(36)}`,
      type,
      title: type === "cta" ? "Ready to begin?" : type === "stats" ? "Key Metrics" : "Section Title",
      badge: "Highlight",
      content: type === "text" ? "Enter your detailed body text here..." : undefined,
      ctaText: type === "cta" ? "Contact Studio" : undefined,
      ctaLink: type === "cta" ? "/p/contact-booking" : undefined,
      items:
        type === "grid" || type === "timeline" || type === "faq" || type === "stats"
          ? [
              { title: "Item 01", description: "Details about this feature or milestone.", tag: "Feature", value: "99%" },
              { title: "Item 02", description: "Another core capability or deliverable.", tag: "Design", value: "24h" },
            ]
          : undefined,
    };
    setEditingPage({ ...editingPage, blocks: [...editingPage.blocks, newBlock] });
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.hero && parsed.showcase) {
            setData(parsed as SiteData);
            showToast("Backup JSON imported successfully! Click Save & Publish to apply.", "success");
          } else {
            showToast("Invalid JSON schema for portfolio data", "error");
          }
        } catch {
          showToast("Failed to parse JSON file", "error");
        }
      };
    }
  };

  // =========================================================================
  // LOGIN FORM VIEW (WHEN NOT AUTHENTICATED)
  // =========================================================================
  // =========================================================================
  // SIMPLE, CLEAN AUTHENTICATION & REGISTRATION GATEWAY
  // =========================================================================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-zinc-800">
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors py-1.5 px-3 rounded-lg hover:bg-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to website
          </Link>
        </div>

        <div className="w-full max-w-[420px] bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative z-10 space-y-6 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shadow-sm mb-1">
              <Shield className="w-5 h-5 text-zinc-300" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs">
              Sign in to access your portfolio management studio.
            </p>
          </div>

          {/* Security Lockout Banner (3 failed attempts -> 15 min lock) */}
          {lockoutRemaining > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs space-y-2.5 animate-pulse-subtle">
              <div className="flex items-center justify-between font-semibold text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" /> Security Lockout Active
                </span>
                <span className="font-mono text-sm px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold">
                  {formatLockoutTime(lockoutRemaining)}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                3 failed attempts detected. Login is locked for 15 minutes for studio security.
              </p>
              {/* Progress Bar for 15 minutes (900 seconds) */}
              <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden border border-amber-800/40">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, (lockoutRemaining / 900) * 100))}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {authError && lockoutRemaining <= 0 && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 flex items-start gap-2.5 text-red-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: CREDENTIALS FORM */}
          {/* ========================================================================= */}
          {authStep === "credentials" && (
            <form onSubmit={handleRequestAuthOtp} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    disabled={isSubmittingAuth || lockoutRemaining > 0}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Password
                  </label>
                  <span className="text-[11px] text-zinc-500">Min. 6 chars</span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isSubmittingAuth || lockoutRemaining > 0}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl pl-9 pr-10 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={lockoutRemaining > 0}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth || lockoutRemaining > 0}
                className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm mt-2 ${
                  lockoutRemaining > 0
                    ? "bg-zinc-900 border border-amber-700/50 text-amber-300 cursor-not-allowed"
                    : "bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer disabled:opacity-50"
                }`}
              >
                {isSubmittingAuth ? (
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : lockoutRemaining > 0 ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Locked ({formatLockoutTime(lockoutRemaining)})</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* FOOTER NOTE */}
              <p className="text-[11px] text-center text-zinc-500 pt-1">
                Portfolio Studio Access
              </p>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: 6-DIGIT OTP VERIFICATION FORM */}
          {/* ========================================================================= */}
          {authStep === "otp" && (
            <form onSubmit={handleVerifyAuthOtp} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Verification code sent</span>
                  <span className="font-mono text-zinc-300">
                    {otpTimer > 0
                      ? `${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, "0")}`
                      : "Expired"}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  {emailDeliveredLive ? (
                    <>A verification code was emailed to <span className="text-white font-medium">{authEmail}</span>.</>
                  ) : (
                    <>Verification code generated for <span className="text-white font-medium">{authEmail}</span>.</>
                  )}
                </p>

                {activeOtpCode && (
                  <div className="mt-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-500">Test Code:</span>
                      <span className="text-sm font-mono font-bold text-zinc-100 tracking-wider">{activeOtpCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthOtp(activeOtpCode);
                        showToast("Code filled", "success");
                      }}
                      className="text-[11px] font-medium px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                    >
                      Use Code
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block text-center">
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={authOtp}
                  onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full bg-zinc-900/70 border border-zinc-800 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/40 rounded-xl py-2.5 text-center text-xl font-mono tracking-[0.4em] text-zinc-100 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthStep("credentials");
                    setAuthError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingAuth || authOtp.length !== 6}
                  className="flex-[2] py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingAuth ? (
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Verify &amp; Continue</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  const allProjectsList = Object.values(data.projects || {});
  const allAvailableImages = [
    ...cloudFiles,
    ...uploadedFiles,
    ...stockFiles,
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col selection:bg-blue-500/30">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-neutral-900/95 border border-white/20 shadow-2xl backdrop-blur-xl animate-fade-in text-sm font-medium">
          {toastType === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0c0d14]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Live Portfolio
          </Link>
          <div className="h-4 w-px bg-white/20" />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="font-bold text-sm tracking-tight text-white uppercase">Studio Control Center</h1>
            </div>
            <p className="text-[11px] text-white/40 font-mono">
              {lastSaved ? `Last synced: ${new Date(lastSaved).toLocaleTimeString()}` : "Ready"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {hasUnsavedChanges && (
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full hidden sm:inline-block">
              ● Unsaved Changes
            </span>
          )}

          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer ${
              hasUnsavedChanges
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 scale-105"
                : "bg-white/10 hover:bg-white hover:text-black text-white"
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden md:inline">Preview</span>
          </Link>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 gap-8">
        {/* SIDEBAR NAVIGATION TABS */}
        <nav className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 select-none">
          <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 px-3 py-2 hidden md:block">
            Content & Sections
          </div>

          <button
            onClick={() => setActiveTab("showcase")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "showcase"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Showcase & Case Studies</span>
          </button>

          <button
            onClick={() => setActiveTab("parallax")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "parallax"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>3D Zoom Parallax (7 Images)</span>
          </button>

          <button
            onClick={() => setActiveTab("process")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "process"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Methodology & Steps</span>
          </button>

          <button
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "sections"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/20 scale-[1.02]"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span>Custom Sections & FX</span>
            {(data.customSections || []).length > 0 && (
              <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                {(data.customSections || []).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("pages")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "pages"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-600/20 scale-[1.02]"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Pages &amp; Templates</span>
            <span className="ml-auto text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-mono font-bold">
              {activePages.length} active
            </span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "media"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Media & Cloud Storage</span>
          </button>

          <button
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "hero"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Hero Morphing Text</span>
          </button>

          <button
            onClick={() => setActiveTab("brand")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "brand"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Brand & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab("preloader")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "preloader"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Preloader Screen</span>
          </button>

          <button
            onClick={() => setActiveTab("philosophy")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "philosophy"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Philosophy & Quote</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "contact"
                ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries & Socials</span>
          </button>

          <div className="my-3 border-t border-white/10 hidden md:block" />

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "security"
                ? "bg-indigo-600 text-white font-bold shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Admin Security</span>
          </button>

          <button
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left whitespace-nowrap ${
              activeTab === "backup"
                ? "bg-white/20 text-white font-bold"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Backup & Reset</span>
          </button>
        </nav>

        {/* CONTENT PANELS */}
        <main className="flex-1 min-w-0">
          {/* ========================================================================= */}
          {/* TAB: 3D ZOOM PARALLAX (WITH 1-CLICK UPLOAD & LIBRARY PICKER) */}
          {/* ========================================================================= */}
          {activeTab === "parallax" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-400" />
                    <span>3D Zoom Parallax Visual Layers</span>
                  </h2>
                  <p className="text-xs text-white/50">
                    Upload images to cloud or choose from your media library for each of the 7 zoom layers.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(data.parallaxImages || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#12131c] border border-white/10 hover:border-white/25 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 transition-all shadow-xl"
                  >
                    {/* Layer Thumbnail Preview */}
                    <div className="relative w-full md:w-40 aspect-[16/10] shrink-0 rounded-xl overflow-hidden bg-black/60 border border-white/15 group">
                      <img src={item.src} alt={item.alt || ""} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase">
                        Layer {idx + 1}
                      </div>
                    </div>

                    {/* Controls & Inputs */}
                    <div className="flex-1 w-full space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                            Layer {idx + 1} Image Source URL
                          </label>
                          <input
                            type="text"
                            value={item.src ?? ""}
                            onChange={(e) => {
                              const newArr = [...data.parallaxImages];
                              newArr[idx] = { ...newArr[idx], src: e.target.value };
                              setData((prev) => ({ ...prev, parallaxImages: newArr }));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                            placeholder="https://i.ibb.co/... or /images2/1.jpg"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                            Alt / Caption Description
                          </label>
                          <input
                            type="text"
                            value={item.alt ?? ""}
                            onChange={(e) => {
                              const newArr = [...data.parallaxImages];
                              newArr[idx] = { ...newArr[idx], alt: e.target.value };
                              setData((prev) => ({ ...prev, parallaxImages: newArr }));
                            }}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="Descriptive label..."
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload New to Cloud</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleParallaxLayerUpload(idx, e)}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setMediaPickerTarget({ type: "parallax", index: idx })}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>Pick from Media Library</span>
                        </button>

                        <div className="flex items-center gap-1.5 sm:ml-auto">
                          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mr-1">Position:</span>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveParallaxLayer(idx, "up")}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Layer Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (data.parallaxImages || []).length - 1}
                            onClick={() => moveParallaxLayer(idx, "down")}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Layer Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PROCESS & METHODOLOGY (WITH 1-CLICK UPLOAD & LIBRARY PICKER) */}
          {/* ========================================================================= */}
          {activeTab === "process" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white mb-2">Section Header</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={data.process?.badge ?? ""}
                      placeholder="Methodology"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          process: { ...prev.process, badge: e.target.value, title: prev.process?.title ?? "", steps: prev.process?.steps ?? [] },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={data.process?.title ?? ""}
                      placeholder="A structured workflow for uncompromising visual results"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          process: { ...prev.process, title: e.target.value, badge: prev.process?.badge ?? "Methodology", steps: prev.process?.steps ?? [] },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Subtitle / Overview
                    </label>
                    <input
                      type="text"
                      value={data.process?.subtitle ?? ""}
                      placeholder="A four-phase architectural journey..."
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          process: { ...prev.process, subtitle: e.target.value, badge: prev.process?.badge ?? "Methodology", title: prev.process?.title ?? "", steps: prev.process?.steps ?? [] },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Workflow Steps ({data.process?.steps?.length || 0})
                </h3>
                <button
                  onClick={() => {
                    const stepNum = String((data.process?.steps?.length || 0) + 1).padStart(2, "0");
                    const newStep: ProcessStep = {
                      num: stepNum,
                      title: "New Workflow Step",
                      description: "Step description outlining deliverables and methodologies.",
                      details: ["Deliverable 1", "Deliverable 2"],
                      image: "/images2/16.jpg",
                    };
                    setData((prev) => ({
                      ...prev,
                      process: {
                        ...prev.process,
                        steps: [...(prev.process?.steps || []), newStep],
                      },
                    }));
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>

              <div className="space-y-6">
                {(data.process?.steps || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-md text-white">
                          Step {step.num}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveProcessStep(idx, "up")}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Step Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (data.process?.steps || []).length - 1}
                            onClick={() => moveProcessStep(idx, "down")}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move Step Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm(`Delete step ${step.num}?`)) return;
                          const newSteps = data.process.steps.filter((_, i) => i !== idx);
                          newSteps.forEach((s, i) => {
                            s.num = String(i + 1).padStart(2, "0");
                          });
                          const updated = {
                            ...data,
                            process: { ...data.process, steps: newSteps },
                          };
                          setData(updated);
                          await saveChanges(updated);
                          showToast(`Step deleted!`, "success");
                        }}
                        className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                          Step Title
                        </label>
                        <input
                          type="text"
                          value={step.title ?? ""}
                          onChange={(e) => {
                            const newSteps = [...data.process.steps];
                            newSteps[idx].title = e.target.value;
                            setData((prev) => ({
                              ...prev,
                              process: { ...prev.process, steps: newSteps },
                            }));
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                          Step Image
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-black/60 border border-white/10 shrink-0">
                            <img src={step.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <input
                            type="text"
                            value={step.image ?? ""}
                            onChange={(e) => {
                              const newSteps = [...data.process.steps];
                              newSteps[idx].image = e.target.value;
                              setData((prev) => ({
                                ...prev,
                                process: { ...prev.process, steps: newSteps },
                              }));
                            }}
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <label className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Upload to Cloud
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleProcessStepUpload(idx, e)}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setMediaPickerTarget({ type: "process", index: idx })}
                            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <FolderOpen className="w-3 h-3 text-blue-400" /> Library
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={step.description ?? ""}
                          onChange={(e) => {
                            const newSteps = [...data.process.steps];
                            newSteps[idx].description = e.target.value;
                            setData((prev) => ({
                              ...prev,
                              process: { ...prev.process, steps: newSteps },
                            }));
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                          Bullet Points (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(step.details || []).join(", ")}
                          onChange={(e) => {
                            const newSteps = [...data.process.steps];
                            newSteps[idx].details = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            setData((prev) => ({
                              ...prev,
                              process: { ...prev.process, steps: newSteps },
                            }));
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: CUSTOM SECTIONS & ANIMATION FX BUILDER */}
          {/* ========================================================================= */}
          {activeTab === "sections" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-amber-400" /> Custom Sections & Kinetic FX
                  </h2>
                  <p className="text-xs text-white/50">
                    Create new sections, choose motion presets, and publish live without writing code.
                  </p>
                </div>
              </div>

              {/* TEMPLATE PICKER PANEL */}
              <div className="bg-[#12131c] border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Add New Dynamic Section
                  </h3>
                </div>
                <p className="text-xs text-white/50">
                  Select a pre-built section layout with ready animations. You can fully customize all contents and styles after adding.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("services")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 hover:border-blue-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 group-hover:text-white flex items-center justify-center mb-2">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Services Grid</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Capabilities & deliverables cards</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("marquee-banner")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Play className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Kinetic Marquee</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Infinite typography ribbon</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("stats")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-cyan-600 hover:text-white border border-white/10 hover:border-cyan-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:text-white flex items-center justify-center mb-2">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Stats & Metrics</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">High-impact number counters</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("testimonials")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/10 hover:border-emerald-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:text-white flex items-center justify-center mb-2">
                      <MessageSquareQuote className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Testimonials</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Client reviews & quotes</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("faq")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 hover:border-amber-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 group-hover:text-white flex items-center justify-center mb-2">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">FAQ Accordion</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Expandable question cards</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("split-showcase")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 hover:border-indigo-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Split Showcase</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Visual narrative split</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("client-logos")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-rose-600 hover:text-white border border-white/10 hover:border-rose-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Grid3X3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Client Logos</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Brand logo grid</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("pricing-table")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 hover:border-blue-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Pricing &amp; Sprints</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Engagement tiers &amp; rates</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("tech-stack")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-cyan-600 hover:text-white border border-white/10 hover:border-cyan-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Tech Stack</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Skills &amp; frameworks</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("awards-rack")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 hover:border-amber-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Awards Rack</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Trophy case honors</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("comparison-slider")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 group-hover:text-white flex items-center justify-center mb-2">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Before &amp; After</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Transformation stages</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("video-reel")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 hover:border-blue-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Play className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Video Motion Reel</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Widescreen showcase reel</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("team-grid")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/10 hover:border-emerald-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Team Collective</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Directors &amp; leadership</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("timeline-roadmap")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-cyan-600 hover:text-white border border-white/10 hover:border-cyan-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Timeline Roadmap</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Studio milestones</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("journal-preview")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 hover:border-indigo-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Journal Preview</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Essays &amp; insights</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("press-mentions")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 hover:border-amber-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Press Mentions</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Media quotes &amp; features</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreateNewSection("audio-player")}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 hover:border-purple-500 text-left transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 group-hover:text-white flex items-center justify-center mb-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-white">Soundscape Bar</div>
                      <div className="text-[10px] text-white/50 group-hover:text-white/80">Ambient visualizer</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* LIST OF CREATED CUSTOM SECTIONS */}
              <div className="space-y-6">
                {(data.customSections || []).length === 0 ? (
                  <div className="p-12 text-center bg-[#12131c] rounded-2xl border border-white/5 text-white/40 space-y-2">
                    <p className="text-sm font-semibold">No custom sections added yet.</p>
                    <p className="text-xs text-white/30">
                      Click any layout template above to create your first custom animated section!
                    </p>
                  </div>
                ) : (
                  (data.customSections || []).map((sec, secIdx) => (
                    <div
                      key={sec.id}
                      className="bg-[#12131c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
                    >
                      {/* Section Card Top Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-mono">
                            {sec.type.replace("-", " ")}
                          </span>
                          <h3 className="text-base font-bold text-white">
                            {sec.title || "Untitled Section"}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCustomSection(sec.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                              sec.enabled
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-white/10 text-white/40 border border-white/10 hover:bg-white/15"
                            }`}
                          >
                            {sec.enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            <span>{sec.enabled ? "Live / Visible" : "Hidden"}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={secIdx === 0}
                              onClick={() => handleMoveCustomSection(secIdx, "up")}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move Section Up on Homepage"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={secIdx === (data.customSections || []).length - 1}
                              onClick={() => handleMoveCustomSection(secIdx, "down")}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move Section Down on Homepage"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection(sec.id)}
                            className="text-white/40 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ANIMATION & VISUAL FX CONFIGURATION BAR */}
                      <div className="bg-[#0b0c13] border border-white/10 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Kinetic Animation Preset
                          </label>
                          <select
                            value={sec.animation}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                animation: e.target.value as AnimationPreset,
                              })
                            }
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="fade-up">Fade Up (Smooth Elevate)</option>
                            <option value="3d-tilt">3D Tilt &amp; Scale (Kinetic)</option>
                            <option value="zoom-in">Zoom In (Scale Reveal)</option>
                            <option value="blur-reveal">Blur Reveal (Cinematic)</option>
                            <option value="kinetic-slide">Kinetic Slide (Horizontal)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                            <Wand2 className="w-3.5 h-3.5 text-purple-400" /> Ambient Glow Light
                          </label>
                          <select
                            value={sec.glowColor || "none"}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                glowColor: e.target.value as any,
                              })
                            }
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="none">No Glow (Clean Dark)</option>
                            <option value="blue">Neon Blue Aura</option>
                            <option value="purple">Cyber Purple Aura</option>
                            <option value="cyan">Electric Cyan Aura</option>
                            <option value="emerald">Emerald Green Aura</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Animation Speed / Duration
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0.3}
                              max={2.0}
                              step={0.1}
                              value={sec.animationSpeed || 0.6}
                              onChange={(e) =>
                                handleUpdateSection(sec.id, {
                                  animationSpeed: parseFloat(e.target.value),
                                })
                              }
                              className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs font-mono text-white/80 w-10 text-right">
                              {(sec.animationSpeed || 0.6).toFixed(1)}s
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION HEADINGS (FOR NON-BANNER TYPES) */}
                      {sec.type !== "marquee-banner" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                              Badge Tag
                            </label>
                            <input
                              type="text"
                              value={sec.badge ?? ""}
                              onChange={(e) => handleUpdateSection(sec.id, { badge: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                              placeholder="e.g. Services & Capabilities"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                              Main Heading
                            </label>
                            <input
                              type="text"
                              value={sec.title ?? ""}
                              onChange={(e) => handleUpdateSection(sec.id, { title: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                              placeholder="e.g. Precision Brand Systems"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                              Subtitle Description
                            </label>
                            <input
                              type="text"
                              value={sec.subtitle ?? ""}
                              onChange={(e) => handleUpdateSection(sec.id, { subtitle: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                              placeholder="e.g. Disciplined visual craft..."
                            />
                          </div>
                        </div>
                      )}

                      {/* MARQUEE BANNER SPECIFIC SETTINGS */}
                      {sec.type === "marquee-banner" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                              Banner Loop Text
                            </label>
                            <input
                              type="text"
                              value={sec.bannerText ?? ""}
                              onChange={(e) => handleUpdateSection(sec.id, { bannerText: e.target.value })}
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                              placeholder="VISUAL SYSTEMS • HIGH-IMPACT EXPERIENCES •"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                              Loop Duration ({sec.bannerSpeed || 20}s)
                            </label>
                            <input
                              type="range"
                              min={5}
                              max={60}
                              value={sec.bannerSpeed || 20}
                              onChange={(e) =>
                                handleUpdateSection(sec.id, {
                                  bannerSpeed: parseInt(e.target.value),
                                })
                              }
                              className="w-full accent-purple-500 mt-2"
                            />
                          </div>
                        </div>
                      )}

                      {/* ITEMS MANAGER */}
                      {sec.type !== "marquee-banner" && (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                              <span>Cards &amp; Items ({sec.items.length})</span>
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleAddItemToSection(sec.id)}
                              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Card / Item
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sec.items.map((item, itmIdx) => (
                              <div
                                key={item.id || itmIdx}
                                className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3 relative group"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-mono text-white/40">#{itmIdx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItemFromSection(sec.id, itmIdx)}
                                    className="text-white/30 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                                      Title
                                    </label>
                                    <input
                                      type="text"
                                      value={item.title ?? ""}
                                      onChange={(e) =>
                                        handleUpdateSectionItem(sec.id, itmIdx, "title", e.target.value)
                                      }
                                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                      placeholder="Title"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                                      {sec.type === "stats" ? "Value (e.g. 120+)" : "Tag / Role"}
                                    </label>
                                    <input
                                      type="text"
                                      value={(sec.type === "stats" ? item.value : item.tag || item.subtitle) ?? ""}
                                      onChange={(e) =>
                                        handleUpdateSectionItem(
                                          sec.id,
                                          itmIdx,
                                          sec.type === "stats" ? "value" : "tag",
                                          e.target.value
                                        )
                                      }
                                      className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                      placeholder={sec.type === "stats" ? "85+" : "Tag"}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                                    Description / Content
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={item.description ?? ""}
                                    onChange={(e) =>
                                      handleUpdateSectionItem(sec.id, itmIdx, "description", e.target.value)
                                    }
                                    className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Enter description..."
                                  />
                                </div>

                                {/* Image selector for items */}
                                {(sec.type === "testimonials" ||
                                  sec.type === "split-showcase" ||
                                  sec.type === "client-logos") && (
                                  <div>
                                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                                      Image / Avatar / Logo
                                    </label>
                                    <div className="flex items-center gap-2">
                                      {item.image && (
                                        <img
                                          src={item.image}
                                          alt=""
                                          className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                        />
                                      )}
                                      <input
                                        type="text"
                                        value={item.image ?? ""}
                                        onChange={(e) =>
                                          handleUpdateSectionItem(sec.id, itmIdx, "image", e.target.value)
                                        }
                                        className="flex-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                                        placeholder="https://... or select library"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setMediaPickerTarget({
                                            type: "custom-section-item",
                                            sectionId: sec.id,
                                            itemIndex: itmIdx,
                                          })
                                        }
                                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                                      >
                                        <FolderOpen className="w-3 h-3 text-blue-400" /> Library
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: STUDIO PAGES BUILDER (ACTIVE PAGES + 20 TEMPLATES) */}
          {/* ========================================================================= */}
          {activeTab === "pages" && (
            <div className="space-y-12 animate-fade-in">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" /> Studio Pages &amp; Templates Manager
                  </h2>
                  <p className="text-xs text-white/50">
                    Use any of the 20 pre-designed templates below to create dedicated subpages, or craft a blank page from scratch.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateNewPage}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 border border-white/10"
                >
                  <Plus className="w-4 h-4 text-cyan-400" /> Create Blank Page
                </button>
              </div>

              {/* SECTION 1: ACTIVE LIVE PAGES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Active Live Pages ({activePages.length})
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-white/40">
                    {activePages.length === 0
                      ? "None live yet — pick a template below to activate"
                      : "Visible on live site & navbar drawer"}
                  </span>
                </div>

                {activePages.length === 0 ? (
                  <div className="p-8 sm:p-12 rounded-3xl bg-[#0e0f18] border border-dashed border-white/15 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                      <Compass className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">No Custom Subpages Active Yet</h4>
                    <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                      Your live website is currently clean. Select any of the <strong>20 pre-designed page templates</strong> below and click <em>&ldquo;Use Template &amp; Create Page&rdquo;</em> to customize and publish it live!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activePages.map((p) => (
                      <div
                        key={p.slug}
                        className="group bg-[#12131c] border border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-5 shadow-xl transition-all hover:-translate-y-1 relative"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Live: /p/{p.slug}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-white/60">
                              {p.category}
                            </span>
                          </div>

                          {p.coverImage && (
                            <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-black/60 border border-white/5">
                              <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div>
                            <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {p.title}
                            </h4>
                            <p className="text-xs text-white/60 line-clamp-2 mt-1">
                              {p.subtitle}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-md text-white/60">
                              {(p.blocks || []).length} Content Blocks
                            </span>
                            {p.variant && (
                              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                                {p.variant}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPage(p);
                              setIsCreatingPage(false);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Edit Page
                          </button>

                          <Link
                            href={`/p/${p.slug}`}
                            target="_blank"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                            title="Open Live Page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeletePage(p.slug)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
                            title="Remove from Live Site"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: 20 PRE-DESIGNED PAGE TEMPLATES */}
              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        20 Pre-Designed Page Templates
                      </h3>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      Click <strong>&ldquo;⚡ Use Template &amp; Create Page&rdquo;</strong> on any design below to customize and activate it.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {["all", "studio", "services", "work", "lab", "resources"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTemplateCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                          templateCategoryFilter === cat
                            ? "bg-cyan-500 text-black font-bold"
                            : "bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTemplates.map((tpl) => {
                    const isAlreadyActive = Boolean(data?.customPages?.[tpl.slug]);
                    return (
                      <div
                        key={tpl.slug}
                        className="group bg-[#0d0e17] border border-white/10 hover:border-cyan-500/40 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-5 shadow-xl transition-all hover:-translate-y-1"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-bold">
                              {tpl.category}
                            </span>
                            <span className="text-[10px] font-mono text-white/40">
                              /p/{tpl.slug}
                            </span>
                          </div>

                          {tpl.coverImage && (
                            <div className="rounded-2xl overflow-hidden aspect-[21/9] bg-black/60 border border-white/5 relative">
                              <img src={tpl.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              {tpl.badge && (
                                <span className="absolute bottom-2.5 left-2.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-white/80 border border-white/10">
                                  {tpl.badge}
                                </span>
                              )}
                            </div>
                          )}

                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {tpl.title}
                            </h4>
                            <p className="text-xs text-white/60 line-clamp-2 mt-1">
                              {tpl.subtitle}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] font-mono bg-white/5 px-2.5 py-1 rounded-md text-white/60">
                              {(tpl.blocks || []).length} Pre-built Blocks
                            </span>
                            {isAlreadyActive && (
                              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                                Active on Site
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => handleUseTemplate(tpl)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            {isAlreadyActive ? "Edit Live Page" : "Use Template & Create"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SHOWCASE & CASE STUDIES MANAGER */}
          {/* ========================================================================= */}
          {activeTab === "showcase" && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Showcase Section Header
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={data.showcase?.headerBadge ?? ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          showcase: { ...prev.showcase, headerBadge: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Main Title
                    </label>
                    <input
                      type="text"
                      value={data.showcase?.headerTitle ?? ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          showcase: { ...prev.showcase, headerTitle: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Subtitle / Description
                    </label>
                    <input
                      type="text"
                      value={data.showcase?.headerSubtitle ?? ""}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          showcase: { ...prev.showcase, headerSubtitle: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE MARQUEE ROW ORDER MANAGER */}
              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                    <span>Live Marquee Sequence & Row Order Manager</span>
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Reorder cards within each conveyor row (Move Left / Right) or switch cards between Row 1 and Row 2.
                  </p>
                </div>

                {/* ROW 1 CONVEYOR */}
                <div className="space-y-3 bg-black/40 border border-blue-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                      <MoveLeft className="w-4 h-4" /> Row 1 Conveyor ({(data.showcase?.row1 || []).length} Cards — Moves Left)
                    </span>
                    <span className="text-[11px] text-white/40 font-mono">Live On Homepage</span>
                  </div>

                  {(data.showcase?.row1 || []).length === 0 ? (
                    <p className="text-xs text-white/40 italic p-3 text-center">No cards in Row 1. Add projects below.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(data.showcase?.row1 || []).map((card, idx) => (
                        <div
                          key={card.id + idx}
                          className="bg-[#151724] border border-blue-500/30 rounded-xl p-2.5 flex flex-col justify-between space-y-2 shadow-md"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={card.imageSrc} alt="" className="w-12 h-9 object-cover rounded-lg shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-blue-400 block truncate">#{idx + 1} {card.tag}</span>
                              <h4 className="text-xs font-bold text-white truncate">{card.title}</h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveShowcaseCard("row1", idx, "left")}
                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 transition-colors cursor-pointer"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (data.showcase?.row1 || []).length - 1}
                                onClick={() => moveShowcaseCard("row1", idx, "right")}
                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 transition-colors cursor-pointer"
                                title="Move Right"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setProjectQuickPlacement(card.id, "row2")}
                              className="text-[10px] px-2 py-0.5 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition-colors cursor-pointer"
                            >
                              &rarr; Row 2
                            </button>

                            <button
                              type="button"
                              onClick={() => setProjectQuickPlacement(card.id, "none")}
                              className="text-[10px] p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove from conveyor (keep case study)"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ROW 2 CONVEYOR */}
                <div className="space-y-3 bg-black/40 border border-purple-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                      <MoveRight className="w-4 h-4" /> Row 2 Conveyor ({(data.showcase?.row2 || []).length} Cards — Moves Right)
                    </span>
                    <span className="text-[11px] text-white/40 font-mono">Live On Homepage</span>
                  </div>

                  {(data.showcase?.row2 || []).length === 0 ? (
                    <p className="text-xs text-white/40 italic p-3 text-center">No cards in Row 2. Add projects below.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(data.showcase?.row2 || []).map((card, idx) => (
                        <div
                          key={card.id + idx}
                          className="bg-[#181524] border border-purple-500/30 rounded-xl p-2.5 flex flex-col justify-between space-y-2 shadow-md"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={card.imageSrc} alt="" className="w-12 h-9 object-cover rounded-lg shrink-0" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono text-purple-400 block truncate">#{idx + 1} {card.tag}</span>
                              <h4 className="text-xs font-bold text-white truncate">{card.title}</h4>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveShowcaseCard("row2", idx, "left")}
                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 transition-colors cursor-pointer"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (data.showcase?.row2 || []).length - 1}
                                onClick={() => moveShowcaseCard("row2", idx, "right")}
                                className="p-1 rounded bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 transition-colors cursor-pointer"
                                title="Move Right"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setProjectQuickPlacement(card.id, "row1")}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white transition-colors cursor-pointer"
                            >
                              &larr; Row 1
                            </button>

                            <button
                              type="button"
                              onClick={() => setProjectQuickPlacement(card.id, "none")}
                              className="text-[10px] p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove from conveyor (keep case study)"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Project Case Studies & Marquee</h2>
                  <p className="text-xs text-white/50">
                    Click &apos;Edit&apos; on any project to modify its full case study details, descriptions, and image galleries.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenProjectModal()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create New Showcase Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allProjectsList.map((proj) => {
                  const inRow1 = data.showcase?.row1?.some((i) => i.id === proj.id);
                  const inRow2 = data.showcase?.row2?.some((i) => i.id === proj.id);

                  return (
                    <div
                      key={proj.id}
                      className="bg-[#12131c] border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                    >
                      <div className="relative aspect-[16/9] bg-neutral-950 overflow-hidden">
                        <img
                          src={proj.imageSrc}
                          alt={proj.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          {proj.tag && (
                            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase text-white border border-white/15">
                              {proj.tag}
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10">
                            {proj.year}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 z-10">
                          {inRow1 && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                              <MoveLeft className="w-3 h-3" /> Row 1
                            </span>
                          )}
                          {inRow2 && (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                              <MoveRight className="w-3 h-3" /> Row 2
                            </span>
                          )}
                          {!inRow1 && !inRow2 && (
                            <span className="px-2.5 py-1 rounded-full bg-white/20 text-[10px] font-semibold text-white/80">
                              Case Study Only
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-4 right-4 z-10">
                          <span className="text-[11px] font-mono text-white/60 block truncate">{proj.url}</span>
                          <h3 className="text-base font-bold text-white tracking-tight truncate">{proj.title}</h3>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                            {proj.description || "No description provided."}
                          </p>

                          {/* Quick Placement Selector */}
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                            <span className="text-[11px] uppercase font-bold text-white/40 tracking-wider">Placement:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setProjectQuickPlacement(proj.id, "row1")}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  inRow1
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                    : "bg-white/5 hover:bg-white/15 text-white/70"
                                }`}
                              >
                                Row 1
                              </button>
                              <button
                                type="button"
                                onClick={() => setProjectQuickPlacement(proj.id, "row2")}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  inRow2
                                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                    : "bg-white/5 hover:bg-white/15 text-white/70"
                                }`}
                              >
                                Row 2
                              </button>
                              <button
                                type="button"
                                onClick={() => setProjectQuickPlacement(proj.id, "none")}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  !inRow1 && !inRow2
                                    ? "bg-white/30 text-white"
                                    : "bg-white/5 hover:bg-white/15 text-white/50"
                                }`}
                              >
                                Off
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md text-white/60 font-mono">
                              📸 {(proj.secondaryImages?.length || 0) + 1} Image(s)
                            </span>
                            {(proj.tools || []).slice(0, 3).map((tool, i) => (
                              <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-white/60">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <Link
                            href={`/project/${proj.id}`}
                            target="_blank"
                            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Case Study
                          </Link>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenProjectModal(proj)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: HERO MORPHING TEXT */}
          {/* ========================================================================= */}
          {activeTab === "hero" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Hero Morphing Text</h2>
                <p className="text-xs text-white/50">
                  Manage the kinetic keywords that continuously morph in the center of the hero section.
                </p>
              </div>

              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Sequential Morphing Keywords ({(data.hero?.words || []).length})
                    </label>
                    <button
                      onClick={() => {
                        const word = prompt("Enter new keyword (e.g. BRANDING):");
                        if (word && word.trim()) {
                          setData((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              words: [...(prev.hero?.words || []), word.trim().toUpperCase()],
                            },
                          }));
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Keyword
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {(data.hero?.words || []).map((word, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-black/60 border border-white/15 px-4 py-2 rounded-xl text-sm font-bold tracking-tight text-white"
                      >
                        <input
                          type="text"
                          value={word}
                          onChange={(e) => {
                            const newWords = [...data.hero.words];
                            newWords[idx] = e.target.value.toUpperCase();
                            setData((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, words: newWords },
                            }));
                          }}
                          className="bg-transparent border-none focus:outline-none w-28 uppercase font-bold"
                        />
                        <button
                          onClick={() => {
                            const newWords = data.hero.words.filter((_, i) => i !== idx);
                            setData((prev) => ({
                              ...prev,
                              hero: { ...prev.hero, words: newWords },
                            }));
                          }}
                          className="text-white/40 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Morph Transition Speed (Seconds)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.4"
                      max="4.0"
                      value={data.hero?.morphTime ?? 1.2}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, morphTime: parseFloat(e.target.value) || 1.2 },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Cooldown Delay Between Words (Seconds)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      value={data.hero?.cooldownTime ?? 0.4}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, cooldownTime: parseFloat(e.target.value) || 0.4 },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: BRAND & IDENTITY */}
          {/* ========================================================================= */}
          {activeTab === "brand" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Brand Profile & Header CTA</h2>
                <p className="text-xs text-white/50">
                  Manage the global studio name, tagline, and navigation button text.
                </p>
              </div>

              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Studio / Brand Name
                    </label>
                    <input
                      type="text"
                      value={data.brand?.name ?? ""}
                      placeholder="e.g. PORTFOLIO"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          brand: { ...prev.brand, name: e.target.value, tagline: prev.brand?.tagline ?? "", navCtaText: prev.brand?.navCtaText ?? "Let's Talk" },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Top Navigation CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={data.brand?.navCtaText ?? ""}
                      placeholder="e.g. Let's Talk"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          brand: { ...prev.brand, navCtaText: e.target.value, name: prev.brand?.name ?? "PORTFOLIO", tagline: prev.brand?.tagline ?? "" },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Brand Tagline / Descriptor
                    </label>
                    <input
                      type="text"
                      value={data.brand?.tagline ?? ""}
                      placeholder="e.g. VISUAL & BRAND DESIGN STUDIO • EST. 2026"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          brand: { ...prev.brand, tagline: e.target.value, name: prev.brand?.name ?? "PORTFOLIO", navCtaText: prev.brand?.navCtaText ?? "Let's Talk" },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PRELOADER SCREEN */}
          {/* ========================================================================= */}
          {activeTab === "preloader" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Preloader Screen Customization</h2>
                <p className="text-xs text-white/50">
                  Customize the full-screen cinematic loading screen words and labels.
                </p>
              </div>

              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Top Left Label
                    </label>
                    <input
                      type="text"
                      value={data.preloader?.studioLabel ?? ""}
                      placeholder="STUDIO"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          preloader: {
                            ...prev.preloader,
                            studioLabel: e.target.value,
                            loadingLabel: prev.preloader?.loadingLabel ?? "LOADING...",
                            bottomLeft: prev.preloader?.bottomLeft ?? "",
                            bottomRight: prev.preloader?.bottomRight ?? "",
                            words: prev.preloader?.words ?? [],
                          },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Top Right Loading Indicator Label
                    </label>
                    <input
                      type="text"
                      value={data.preloader?.loadingLabel ?? ""}
                      placeholder="LOADING..."
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          preloader: {
                            ...prev.preloader,
                            loadingLabel: e.target.value,
                            studioLabel: prev.preloader?.studioLabel ?? "STUDIO",
                            bottomLeft: prev.preloader?.bottomLeft ?? "",
                            bottomRight: prev.preloader?.bottomRight ?? "",
                            words: prev.preloader?.words ?? [],
                          },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Bottom Left Tagline
                    </label>
                    <input
                      type="text"
                      value={data.preloader?.bottomLeft ?? ""}
                      placeholder="VISUAL ARCHITECTURE"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          preloader: {
                            ...prev.preloader,
                            bottomLeft: e.target.value,
                            studioLabel: prev.preloader?.studioLabel ?? "STUDIO",
                            loadingLabel: prev.preloader?.loadingLabel ?? "LOADING...",
                            bottomRight: prev.preloader?.bottomRight ?? "",
                            words: prev.preloader?.words ?? [],
                          },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Bottom Right Tagline
                    </label>
                    <input
                      type="text"
                      value={data.preloader?.bottomRight ?? ""}
                      placeholder="CREATING DISTINCT DESIGN EMPIRES"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          preloader: {
                            ...prev.preloader,
                            bottomRight: e.target.value,
                            studioLabel: prev.preloader?.studioLabel ?? "STUDIO",
                            loadingLabel: prev.preloader?.loadingLabel ?? "LOADING...",
                            bottomLeft: prev.preloader?.bottomLeft ?? "",
                            words: prev.preloader?.words ?? [],
                          },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Loading Kinetic Words Sequence
                    </label>
                    <button
                      onClick={() => {
                        const word = prompt("Enter new preloader keyword (e.g. MINIMALISM):");
                        if (word && word.trim()) {
                          setData((prev) => ({
                            ...prev,
                            preloader: {
                              ...prev.preloader,
                              studioLabel: prev.preloader?.studioLabel ?? "STUDIO",
                              loadingLabel: prev.preloader?.loadingLabel ?? "LOADING...",
                              bottomLeft: prev.preloader?.bottomLeft ?? "",
                              bottomRight: prev.preloader?.bottomRight ?? "",
                              words: [...(prev.preloader?.words ?? []), word.trim().toUpperCase()],
                            },
                          }));
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Keyword
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {(data.preloader?.words ?? []).map((w, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-black/60 border border-white/15 px-4 py-2 rounded-xl text-xs font-bold tracking-tight text-white"
                      >
                        <input
                          type="text"
                          value={w}
                          onChange={(e) => {
                            const newW = [...(data.preloader?.words ?? [])];
                            newW[idx] = e.target.value.toUpperCase();
                            setData((prev) => ({
                              ...prev,
                              preloader: {
                                ...prev.preloader,
                                studioLabel: prev.preloader?.studioLabel ?? "STUDIO",
                                loadingLabel: prev.preloader?.loadingLabel ?? "LOADING...",
                                bottomLeft: prev.preloader?.bottomLeft ?? "",
                                bottomRight: prev.preloader?.bottomRight ?? "",
                                words: newW,
                              },
                            }));
                          }}
                          className="bg-transparent border-none focus:outline-none w-28 uppercase font-mono"
                        />
                        <button
                          onClick={() => {
                            const newW = (data.preloader?.words ?? []).filter((_, i) => i !== idx);
                            setData((prev) => ({
                              ...prev,
                              preloader: {
                                ...prev.preloader,
                                studioLabel: prev.preloader?.studioLabel ?? "STUDIO",
                                loadingLabel: prev.preloader?.loadingLabel ?? "LOADING...",
                                bottomLeft: prev.preloader?.bottomLeft ?? "",
                                bottomRight: prev.preloader?.bottomRight ?? "",
                                words: newW,
                              },
                            }));
                          }}
                          className="text-white/40 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PHILOSOPHY & QUOTE */}
          {/* ========================================================================= */}
          {activeTab === "philosophy" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Philosophy & Manifesto Statement</h2>
                <p className="text-xs text-white/50">
                  Update the section badge, statement quote, and attribution signature. Wrap words with **double asterisks** for bold highlighting.
                </p>
              </div>

              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Section Badge
                    </label>
                    <input
                      type="text"
                      value={data.philosophy?.badge ?? ""}
                      placeholder="Manifesto"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          philosophy: { ...prev.philosophy, badge: e.target.value, quote: prev.philosophy?.quote ?? "" },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Author Attribution / Signature
                    </label>
                    <input
                      type="text"
                      value={data.philosophy?.author ?? ""}
                      placeholder="DESIGN PHILOSOPHY — 2026"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          philosophy: { ...prev.philosophy, author: e.target.value, quote: prev.philosophy?.quote ?? "" },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-white block mb-1.5">
                    Statement Quote
                  </label>
                  <textarea
                    rows={5}
                    value={data.philosophy?.quote ?? ""}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        philosophy: { ...prev.philosophy, quote: e.target.value },
                      }))
                    }
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed font-mono resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: INQUIRIES & CONTACT */}
          {/* ========================================================================= */}
          {activeTab === "contact" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Inquiries & Contact Details</h2>
                <p className="text-xs text-white/50">
                  Manage contact email address, social links, and footer copyright text.
                </p>
              </div>

              <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Direct Email Address
                    </label>
                    <input
                      type="email"
                      value={data.contact?.email ?? ""}
                      placeholder="inquire@example.com"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, email: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Copyright Notice
                    </label>
                    <input
                      type="text"
                      value={data.contact?.copyright ?? ""}
                      placeholder="STUDIO. ALL RIGHTS RESERVED."
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, copyright: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Heading Title
                    </label>
                    <input
                      type="text"
                      value={data.contact?.title ?? ""}
                      placeholder="Let's co-create your brand's future"
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, title: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={data.contact?.subtitle ?? ""}
                      placeholder="Whether initializing a new venture or elevating an established name..."
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, subtitle: e.target.value },
                        }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-white">
                      Social Channels
                    </label>
                    <button
                      onClick={() => {
                        const newSocials = [...(data.contact?.socials || []), { name: "Twitter", url: "https://" }];
                        setData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, socials: newSocials },
                        }));
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Channel
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(data.contact?.socials || []).map((social, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Platform Name"
                          value={social.name ?? ""}
                          onChange={(e) => {
                            const newSocials = [...data.contact.socials];
                            newSocials[idx].name = e.target.value;
                            setData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, socials: newSocials },
                            }));
                          }}
                          className="w-1/3 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="https://..."
                          value={social.url ?? ""}
                          onChange={(e) => {
                            const newSocials = [...data.contact.socials];
                            newSocials[idx].url = e.target.value;
                            setData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, socials: newSocials },
                            }));
                          }}
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => {
                            const newSocials = data.contact.socials.filter((_, i) => i !== idx);
                            setData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, socials: newSocials },
                            }));
                          }}
                          className="text-white/40 hover:text-red-400 p-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MEDIA & CLOUD STORAGE (IMGBB) */}
          {/* ========================================================================= */}
          {activeTab === "media" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                    <Cloud className="w-6 h-6 text-blue-400" />
                    <span>Media & 100% Free Cloud Storage</span>
                  </h2>
                  <p className="text-xs text-white/50">
                    Upload images straight to the cloud via ImgBB global CDN. Zero storage used on your computer.
                  </p>
                </div>
                <button
                  onClick={loadMedia}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  Refresh Library
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#121422] to-[#15172a] border border-blue-500/20 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">ImgBB Free Cloud Storage</h3>
                      <p className="text-xs text-white/50">Unlimited free image hosting • Worldwide high-speed CDN</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasImgbbKey ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cloud Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Local Mode (Enter Free Key Below)
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Paste your Free ImgBB API Key here..."
                      value={imgbbKeyInput ?? ""}
                      onChange={(e) => setImgbbKeyInput(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveImgbbKey}
                      disabled={isSavingKey}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      {isSavingKey ? "Saving..." : "Save Key"}
                    </button>

                    <a
                      href="https://api.imgbb.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white hover:text-black text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 text-center"
                    >
                      <span>Get Free Key</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileUpload}
                className="border-2 border-dashed border-white/20 hover:border-blue-500 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-[#12131c]/50 transition-colors relative"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  {isUploading ? "Uploading Directly to Cloud..." : "Click or Drag & Drop Images Here"}
                </h3>
                <p className="text-xs text-white/50 max-w-sm">
                  {hasImgbbKey
                    ? "Images upload straight to ImgBB CDN and receive permanent HTTPS links."
                    : "Supports JPG, PNG, WEBP, SVG, and GIF."}
                </p>
              </div>

              {cloudFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-blue-400" /> ImgBB Cloud Assets ({cloudFiles.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cloudFiles.map((url) => (
                      <div
                        key={url}
                        className="group relative bg-[#12131c] border border-blue-500/20 rounded-xl overflow-hidden aspect-[4/3] p-2 flex flex-col justify-between hover:border-blue-500 transition-all shadow-md"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setQuickAssignUrl(url)}
                            className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Assign to Section
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url)}
                            className="w-full py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy URL
                          </button>
                          <span className="text-[9px] font-mono text-white/50 truncate max-w-full">{url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Uploaded Assets ({uploadedFiles.length})
                </h3>
                {uploadedFiles.length === 0 ? (
                  <p className="text-xs text-white/40 italic p-6 bg-[#12131c] rounded-xl border border-white/5">
                    No uploads yet. Drag & drop files above to add assets.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedFiles.map((url) => (
                      <div
                        key={url}
                        className="group relative bg-[#12131c] border border-white/10 rounded-xl overflow-hidden aspect-[4/3] p-2 flex flex-col justify-between hover:border-blue-500 transition-all shadow-md"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                          <button
                            type="button"
                            onClick={() => setQuickAssignUrl(url)}
                            className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Assign to Section
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url)}
                            className="w-full py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy URL
                          </button>
                          <span className="text-[9px] font-mono text-white/50 truncate max-w-full">{url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/70">
                  Stock Portfolio Assets ({stockFiles.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stockFiles.map((url) => (
                    <div
                      key={url}
                      className="group relative bg-[#12131c] border border-white/10 rounded-xl overflow-hidden aspect-[4/3] p-2 flex flex-col justify-between hover:border-blue-500 transition-all shadow-md"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setQuickAssignUrl(url)}
                          className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Assign to Section
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(url)}
                          className="w-full py-1 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copy URL
                        </button>
                        <span className="text-[9px] font-mono text-white/50 truncate max-w-full">{url}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: FORTRESS 2FA ADMIN SECURITY & 2-ACCOUNT CONTROL */}
          {/* ========================================================================= */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" /> Fortress 2FA Security &amp; Admin Accounts
                  </h2>
                  <p className="text-xs text-white/50">
                    Maximum 2 authorized administrator accounts strictly enforced. Guarded by two-factor OTP verification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    accountsList.length >= 2
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {accountsList.length} / 2 Accounts Used
                  </span>
                </div>
              </div>

              {/* SECURITY STATUS QUOTA BAR */}
              <div className="p-6 rounded-3xl bg-[#0e0f18] border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Admin Account Quota (Strict Max: 2)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {accountsList.length === 2 ? "100% (Registration Locked)" : `${(accountsList.length / 2) * 100}% Capacity`}
                  </span>
                </div>

                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(accountsList.length / 2) * 100}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      accountsList.length === 2 ? "bg-gradient-to-r from-amber-500 to-red-500" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    }`}
                  />
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  {accountsList.length >= 2
                    ? "🛡️ Maximum capacity reached. All unauthorized registrations are strictly blocked. To register a new administrator, you must first delete one of the existing accounts below."
                    : "⚡ 1 account slot remains available. You can register 1 additional Co-Administrator."}
                </p>
              </div>

              {/* SECTION 1: REGISTERED ADMIN ACCOUNTS */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Authorized Administrators ({accountsList.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {accountsList.map((acc, idx) => {
                    const isCurrent = currentUser?.email.toLowerCase() === acc.email.toLowerCase();
                    return (
                      <div
                        key={acc.id || idx}
                        className={`p-6 rounded-3xl bg-[#12131c] border flex flex-col justify-between space-y-5 transition-all ${
                          isCurrent ? "border-cyan-500/50 shadow-xl shadow-cyan-500/10" : "border-white/10"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-400">
                              Account #{idx + 1}
                            </span>
                            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              acc.role === "owner" ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"
                            }`}>
                              {acc.role === "owner" ? "Primary Owner" : "Co-Admin"}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-white font-mono flex items-center gap-2">
                              {acc.email}
                              {isCurrent && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-sans uppercase">
                                  You
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-white/50 font-mono mt-1">
                              Created: {new Date(acc.createdAt).toLocaleDateString()}
                            </p>
                            {acc.lastLogin && (
                              <p className="text-[11px] text-white/40 font-mono">
                                Last 2FA Login: {new Date(acc.lastLogin).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setNewPasswordEmail(acc.email)}
                            className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            Change Password →
                          </button>

                          {accountsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAdminAccount(acc.id, acc.email)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white transition-colors cursor-pointer"
                              title="Delete Admin Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: CHANGE PASSWORD */}
              <div className="bg-[#12131c] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" /> Update Admin Password
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Set a new strong password for your administrator account.
                  </p>
                </div>

                <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                      Target Account Email
                    </label>
                    <input
                      type="email"
                      value={newPasswordEmail || currentUser?.email || ""}
                      onChange={(e) => setNewPasswordEmail(e.target.value)}
                      placeholder="e.g. avadh@gmail.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                      New Password (Min. 6 Characters)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingPassword ? "Updating..." : "Save New Password"}
                  </button>
                </form>
              </div>

              {/* SECTION 3: REAL EMAIL OTP (GMAIL / SMTP GATEWAY) */}
              <div className="bg-[#12131c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Mail className="w-5 h-5 text-cyan-400" /> Real Email OTP Delivery (Gmail / SMTP Gateway)
                    </h3>
                    <p className="text-xs text-white/60">
                      Connect your Gmail or SMTP server so real 6-digit OTP codes are delivered straight to your email inbox whenever anyone attempts to sign in or register.
                    </p>
                  </div>

                  <div>
                    {hasSmtp ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Real Email Connected: {smtpUser}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        ○ Real Email Not Configured
                      </span>
                    )}
                  </div>
                </div>

                {/* 60-Second Gmail App Password Guide */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> How to Setup Free Gmail Delivery in 60 Seconds:
                  </span>
                  <ol className="text-xs text-white/70 space-y-1 pl-4 list-decimal leading-relaxed">
                    <li>Open your Google Account at <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-mono">myaccount.google.com/security</a></li>
                    <li>Ensure <strong>2-Step Verification</strong> is turned <strong>ON</strong>.</li>
                    <li>Search or click on <strong>&ldquo;App passwords&rdquo;</strong> (or go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-cyan-300 underline font-mono">myaccount.google.com/apppasswords</a>).</li>
                    <li>Name it <em>&ldquo;Portfolio Admin&rdquo;</em>, click <strong>Create</strong>, and copy the 16-character code (e.g. <code>abcd efgh ijkl mnop</code>).</li>
                    <li>Paste your Gmail address and that 16-letter App Password below and click <strong>Save SMTP Settings</strong>!</li>
                  </ol>
                </div>

                <form onSubmit={handleSaveSmtp} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                        Email Service Provider
                      </label>
                      <select
                        value={smtpService}
                        onChange={(e) => setSmtpService(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="gmail">Google Gmail (Recommended)</option>
                        <option value="custom">Custom SMTP Server</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                        Sender Display Name
                      </label>
                      <input
                        type="text"
                        value={smtpFromName}
                        onChange={(e) => setSmtpFromName(e.target.value)}
                        placeholder="Studio Security"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                      Sender Gmail / Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="e.g. yourportfolio@gmail.com"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block mb-1.5">
                      Gmail App Password (16 Letters) *
                    </label>
                    <input
                      type="password"
                      required
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingSmtp}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSmtp ? "Saving..." : "Save SMTP Settings"}
                    </button>

                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp || !smtpUser || !smtpPass}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2 border border-white/10"
                    >
                      {isTestingSmtp ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                      )}
                      <span>Send Test OTP to My Email</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SECTION 4: SESSION REVOKE */}
              <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-400" /> Active Session Lockdown
                  </h4>
                  <p className="text-xs text-white/50">
                    Immediately revoke your active session token and lock the admin dashboard behind 2FA.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  Log Out &amp; Lock Studio
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: BACKUP & DATA MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "backup" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Backup & Data Management</h2>
                <p className="text-xs text-white/50">
                  Export snapshot files of your portfolio content, import backup states, or restore default values.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4">
                  <div>
                    <Download className="w-8 h-8 text-blue-400 mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">Export JSON Backup</h3>
                    <p className="text-xs text-white/60">
                      Download a complete copy of all your portfolio projects, images, texts, and settings.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Download JSON File
                  </button>
                </div>

                <div className="bg-[#12131c] border border-white/10 rounded-2xl p-6 flex flex-col justify-between gap-4">
                  <div>
                    <FolderUp className="w-8 h-8 text-emerald-400 mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">Import JSON Backup</h3>
                    <p className="text-xs text-white/60">
                      Upload a previously exported JSON backup file to restore portfolio configuration.
                    </p>
                  </div>
                  <label className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white hover:text-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center block">
                    Select JSON to Restore
                    <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  </label>
                </div>

                <div className="sm:col-span-2 bg-red-950/20 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-red-300 mb-1">Reset to Original Defaults</h3>
                    <p className="text-xs text-red-200/60">
                      Reverts all texts, images, and showcase cards to the starter templates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to revert all site data to default templates?")) {
                        resetToDefaults();
                        showToast("Site data reset to default templates", "success");
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                  >
                    Reset Everything
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* FULL PROJECT & CASE STUDY MODAL EDITOR WITH GALLERY MANAGEMENT */}
      {/* ========================================================================= */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#10111a] border border-white/20 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151722]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {isCreatingNew ? "Create Showcase Project & Case Study" : `Editing: ${editingProject.title}`}
                  </h3>
                  <p className="text-xs text-white/50 font-mono">
                    Case Study URL: /project/{editingProject.id}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isCreatingNew && (
                  <Link
                    href={`/project/${editingProject.id}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Page
                  </Link>
                )}
                <button
                  onClick={() => setEditingProject(null)}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1 text-sm">
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5">
                <label className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-3">
                  Live Marquee Conveyor Placement
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setProjectPlacement("row1")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      projectPlacement === "row1"
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                    }`}
                  >
                    <MoveLeft className="w-4 h-4" /> Row 1 (Moves Left)
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectPlacement("row2")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      projectPlacement === "row2"
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                    }`}
                  >
                    <MoveRight className="w-4 h-4" /> Row 2 (Moves Right)
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectPlacement("none")}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      projectPlacement === "none"
                        ? "bg-white/20 border-white text-white"
                        : "bg-white/5 border-white/10 text-white/70 hover:border-white/30"
                    }`}
                  >
                    Case Study Only
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  1. General Project Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={editingProject.title ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Brand Design"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      URL Slug ID *
                    </label>
                    <input
                      type="text"
                      value={editingProject.id ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="e.g. brand-identity"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingProject.category ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Packaging & Visual Identity"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Display Tag Badge
                    </label>
                    <input
                      type="text"
                      value={editingProject.tag ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, tag: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Skincare, Digital Art, Bakery"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Domain URL
                    </label>
                    <input
                      type="text"
                      value={editingProject.url ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, url: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="e.g. studio.design"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      value={editingProject.year ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                      placeholder="2026"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  2. Primary Hero Cover Image
                </h4>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row gap-5 items-center">
                  <div className="relative w-full sm:w-48 aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0">
                    <img src={editingProject.imageSrc} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    <label className="text-xs font-semibold text-white/60 block">
                      Image Path or Online URL (Supports ImgBB Cloud, /images2/..., or https://...)
                    </label>
                    <input
                      type="text"
                      value={editingProject.imageSrc ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, imageSrc: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="e.g. https://i.ibb.co/... or /images2/27.jpg"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5" /> Upload New Cover to Cloud
                        <input type="file" accept="image/*" onChange={handleProjectCoverUpload} className="hidden" />
                      </label>

                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget({ type: "project-cover" })}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-blue-400" /> Pick from Library
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  3. Case Study Narrative & Text Content
                </h4>

                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Overview Narrative Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProject.description ?? ""}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-red-400 uppercase tracking-wider block mb-1">
                      Design Challenge
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.challenge ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, challenge: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none text-xs leading-relaxed"
                      placeholder="What was the creative challenge for this client?"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                      Architectural Solution
                    </label>
                    <textarea
                      rows={3}
                      value={editingProject.solution ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, solution: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none text-xs leading-relaxed"
                      placeholder="How did you resolve it visually and strategically?"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Client Name
                    </label>
                    <input
                      type="text"
                      value={editingProject.client ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      placeholder="e.g. Willow & Whisk Bakery"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Discipline / Role
                    </label>
                    <input
                      type="text"
                      value={editingProject.role ?? ""}
                      onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                      placeholder="e.g. Lead Brand & Packaging Designer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-2">
                    Tools & Technologies Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {(editingProject.tools || []).map((tool, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-xs text-white"
                      >
                        {tool}
                        <button
                          type="button"
                          onClick={() => {
                            const newTools = (editingProject.tools || []).filter((_, i) => i !== idx);
                            setEditingProject({ ...editingProject, tools: newTools });
                          }}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Add tool tag (e.g. Next.js)..."
                        value={newToolInput}
                        onChange={(e) => setNewToolInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newToolInput.trim()) {
                            e.preventDefault();
                            setEditingProject({
                              ...editingProject,
                              tools: [...(editingProject.tools || []), newToolInput.trim()],
                            });
                            setNewToolInput("");
                          }
                        }}
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-48"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newToolInput.trim()) {
                            setEditingProject({
                              ...editingProject,
                              tools: [...(editingProject.tools || []), newToolInput.trim()],
                            });
                            setNewToolInput("");
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      4. Case Study Visual Gallery & Asset Group
                    </h4>
                    <p className="text-xs text-white/50">
                      Add, upload, or arrange the high-resolution mockups displayed on the project page.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-600/20">
                      {isModalUploading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload to Cloud</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleProjectGalleryUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setMediaPickerTarget({ type: "project-gallery" })}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pick from Library</span>
                    </button>
                  </div>
                </div>

                {(editingProject.secondaryImages || []).length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center bg-black/20">
                    <ImageIcon className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-xs text-white/50">No secondary gallery images added yet.</p>
                    <p className="text-[11px] text-white/30">
                      Click &quot;Upload to Cloud&quot; or &quot;Pick from Library&quot; above to include packaging mockups or UI screens.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(editingProject.secondaryImages || []).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-neutral-900 border border-white/10 rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-between"
                      >
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            type="button"
                            title="Set as Primary Cover"
                            onClick={() => {
                              const oldCover = editingProject.imageSrc;
                              const newSec = (editingProject.secondaryImages || []).filter((_, i) => i !== idx);
                              setEditingProject({
                                ...editingProject,
                                imageSrc: imgUrl,
                                secondaryImages: [...newSec, oldCover],
                              });
                              showToast("Set as primary cover image!", "success");
                            }}
                            className="p-1.5 rounded-lg bg-black/80 hover:bg-blue-600 text-white text-xs transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Remove image"
                            onClick={() => {
                              const newSec = (editingProject.secondaryImages || []).filter((_, i) => i !== idx);
                              setEditingProject({ ...editingProject, secondaryImages: newSec });
                            }}
                            className="p-1.5 rounded-lg bg-black/80 hover:bg-red-600 text-white text-xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/80 backdrop-blur-sm text-[9px] font-mono text-white/70 truncate">
                          {imgUrl}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#151722] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProjectModal}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Project & Case Study
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REUSABLE MEDIA PICKER MODAL (1-CLICK ASSIGN TO ANY IMAGE PLACE) */}
      {/* ========================================================================= */}
      {mediaPickerTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#10111a] border border-white/20 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#151722]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-400" />
                  <span>
                    Select Image for{" "}
                    {mediaPickerTarget.type === "parallax"
                      ? `Parallax Layer ${(mediaPickerTarget.index ?? 0) + 1}`
                      : mediaPickerTarget.type === "process"
                      ? `Methodology Step ${(mediaPickerTarget.index ?? 0) + 1}`
                      : mediaPickerTarget.type === "project-cover"
                      ? "Project Primary Cover"
                      : "Project Gallery"}
                  </span>
                </h3>
                <p className="text-xs text-white/50">Click any image to set it instantly.</p>
              </div>

              <button
                onClick={() => setMediaPickerTarget(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {allAvailableImages.length === 0 ? (
                <div className="p-12 text-center text-white/40">
                  No images found. Please upload images in the &quot;Media &amp; Cloud Storage&quot; tab.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {allAvailableImages.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectImageForTarget(url)}
                      className="group relative bg-neutral-900 border border-white/10 hover:border-blue-500 rounded-xl overflow-hidden aspect-[4/3] cursor-pointer transition-all hover:scale-105 shadow-md"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-center p-2">
                        <Check className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 px-2 py-0.5 rounded">
                          Choose This Image
                        </span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-sm p-1 text-[9px] font-mono text-white/70 truncate">
                        {url}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#151722] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setMediaPickerTarget(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK ASSIGN IMAGE MODAL */}
      {/* ========================================================================= */}
      {quickAssignUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#10111a] border border-white/20 rounded-3xl max-w-2xl w-full flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151722]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Where would you like to use this image?
                  </h3>
                  <p className="text-xs text-white/50">Click any destination to place and publish it immediately.</p>
                </div>
              </div>
              <button
                onClick={() => setQuickAssignUrl(null)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 max-h-[75vh]">
              {/* Image Preview */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                <img src={quickAssignUrl} alt="" className="w-24 h-16 object-cover rounded-xl shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/50 block">Selected Asset</span>
                  <p className="text-xs font-mono text-white/80 truncate mt-0.5">{quickAssignUrl}</p>
                </div>
              </div>

              {/* 1. Zoom Parallax Layers */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                  1. Set as 3D Zoom Parallax Layer (Homepage)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(data.parallaxImages || []).map((_, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleQuickAssign("parallax", pIdx)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Layer {pIdx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Process / Methodology Steps */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
                  2. Set as Workflow Step Image (Homepage)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(data.process?.steps || []).map((step, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleQuickAssign("process", sIdx)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer text-center truncate"
                      title={step.title}
                    >
                      Step {step.num}: {step.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Project Primary Cover */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                  3. Set as Project Primary Cover & Marquee Card
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allProjectsList.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleQuickAssign("project-cover", proj.id)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer text-left truncate flex items-center justify-between"
                    >
                      <span className="truncate">{proj.title}</span>
                      <span className="text-[10px] opacity-60 ml-2 font-mono shrink-0">Cover</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Add to Project Gallery */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  4. Add into Project Case Study Gallery
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allProjectsList.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleQuickAssign("project-gallery", proj.id)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer text-left truncate flex items-center justify-between"
                    >
                      <span className="truncate">{proj.title}</span>
                      <span className="text-[10px] opacity-60 ml-2 font-mono shrink-0">+ Gallery</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#151722] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setQuickAssignUrl(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM PAGE EDITOR MODAL / DRAWER */}
      {/* ========================================================================= */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#10111a] border border-white/20 rounded-3xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#151722]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {isCreatingPage ? "Create New Studio Subpage" : `Edit Page: ${editingPage.title}`}
                  </h3>
                  <p className="text-xs text-white/50 font-mono">
                    Live URL: /p/{editingPage.slug}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPage(null);
                  setIsCreatingPage(false);
                }}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* PAGE GENERAL META */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Page Meta &amp; Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Page Title
                    </label>
                    <input
                      type="text"
                      value={editingPage.title ?? ""}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-bold"
                      placeholder="e.g. Tactile Packaging Lab"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      URL Slug (/p/...)
                    </label>
                    <input
                      type="text"
                      value={editingPage.slug ?? ""}
                      onChange={(e) =>
                        setEditingPage({
                          ...editingPage,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"),
                        })
                      }
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      placeholder="e.g. packaging-lab"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={editingPage.category || "studio"}
                      onChange={(e) =>
                        setEditingPage({
                          ...editingPage,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="studio">Studio</option>
                      <option value="services">Services</option>
                      <option value="work">Work</option>
                      <option value="lab">Lab &amp; R&amp;D</option>
                      <option value="resources">Resources</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1 font-bold">
                      Layout Variety (20 Themes)
                    </label>
                    <select
                      value={editingPage.variant || "standard-editorial"}
                      onChange={(e) =>
                        setEditingPage({
                          ...editingPage,
                          variant: e.target.value as any,
                        })
                      }
                      className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                    >
                      <option value="standard-editorial">📖 Classic Editorial</option>
                      <option value="cinema-horizontal">🎬 Cinema Horizontal Scroll</option>
                      <option value="bento-grid">🍱 Bento Box Matrix</option>
                      <option value="brutalist-index">⚡ Neo-Brutalist Index</option>
                      <option value="editorial-lookbook">✨ Haute Lookbook</option>
                      <option value="cyber-hud">🤖 Cyberpunk HUD Terminal</option>
                      <option value="3d-card-stack">🃏 3D Stacked Deck</option>
                      <option value="radial-orbital">🪐 Orbital Galaxy Wheel</option>
                      <option value="split-duel-scroll">⚖️ Split Duel Scroll</option>
                      <option value="immersive-fullscreen-zoom">🔭 Immersive Fullscreen Zoom</option>
                      <option value="interactive-matrix-table">📊 Data Matrix Spreadsheet</option>
                      <option value="glassmorphism-studio">💎 Frosted Acrylic Glass</option>
                      <option value="kinetic-type-river">🌊 Kinetic Marquee River</option>
                      <option value="swiss-modernist">📐 Swiss International Style</option>
                      <option value="isometric-3d">🧊 Isometric 3D Room</option>
                      <option value="liquid-distortion">💧 Liquid Ripple Canvas</option>
                      <option value="retro-cli-terminal">💻 Interactive ASCII Terminal</option>
                      <option value="newspaper-broadside">📰 Vintage Broadsheet Print</option>
                      <option value="spotlight-darkroom">🔦 Spotlight Darkroom</option>
                      <option value="infinite-spatial-board">🗺️ Spatial Infinite Canvas</option>
                      <option value="3d-carousel-wheel">🎡 3D Cylindrical Carousel</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={editingPage.badge ?? ""}
                      onChange={(e) => setEditingPage({ ...editingPage, badge: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Material Craft"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingPage.coverImage ?? ""}
                        onChange={(e) => setEditingPage({ ...editingPage, coverImage: e.target.value })}
                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerTarget({ type: "custom-page-cover" })}
                        className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Subtitle Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={editingPage.subtitle ?? ""}
                    onChange={(e) => setEditingPage({ ...editingPage, subtitle: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Brief description of this page..."
                  />
                </div>
              </div>

              {/* PAGE CONTENT BLOCKS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    Page Content Blocks ({editingPage.blocks.length})
                  </h4>

                  {/* Add Block Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-white/40 font-mono mr-1">+ Add Block:</span>
                    <button
                      type="button"
                      onClick={() => handleAddBlockToEditingPage("text")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Text / Essay
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlockToEditingPage("grid")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cards Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlockToEditingPage("stats")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Stats
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlockToEditingPage("timeline")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Timeline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlockToEditingPage("faq")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      FAQ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlockToEditingPage("cta")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      CTA Banner
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {editingPage.blocks.map((block, blkIdx) => (
                    <div
                      key={block.id || blkIdx}
                      className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-white/10 px-2.5 py-1 rounded-full text-cyan-400 uppercase">
                            Block {blkIdx + 1}: {block.type}
                          </span>
                          {blkIdx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...editingPage.blocks];
                                const temp = newBlocks[blkIdx - 1];
                                newBlocks[blkIdx - 1] = newBlocks[blkIdx];
                                newBlocks[blkIdx] = temp;
                                setEditingPage({ ...editingPage, blocks: newBlocks });
                              }}
                              className="text-[10px] bg-white/5 hover:bg-white/15 px-2 py-0.5 rounded text-white/70"
                              title="Move Up"
                            >
                              ↑ Up
                            </button>
                          )}
                          {blkIdx < editingPage.blocks.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...editingPage.blocks];
                                const temp = newBlocks[blkIdx + 1];
                                newBlocks[blkIdx + 1] = newBlocks[blkIdx];
                                newBlocks[blkIdx] = temp;
                                setEditingPage({ ...editingPage, blocks: newBlocks });
                              }}
                              className="text-[10px] bg-white/5 hover:bg-white/15 px-2 py-0.5 rounded text-white/70"
                              title="Move Down"
                            >
                              ↓ Down
                            </button>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingPage({
                              ...editingPage,
                              blocks: editingPage.blocks.filter((_, i) => i !== blkIdx),
                            })
                          }
                          className="text-white/40 hover:text-red-400 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                          title="Delete Block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                            Block Heading
                          </label>
                          <input
                            type="text"
                            value={block.title ?? ""}
                            onChange={(e) => {
                              const newBlocks = [...editingPage.blocks];
                              newBlocks[blkIdx] = { ...newBlocks[blkIdx], title: e.target.value };
                              setEditingPage({ ...editingPage, blocks: newBlocks });
                            }}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="Heading..."
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                            Badge Tag
                          </label>
                          <input
                            type="text"
                            value={block.badge ?? ""}
                            onChange={(e) => {
                              const newBlocks = [...editingPage.blocks];
                              newBlocks[blkIdx] = { ...newBlocks[blkIdx], badge: e.target.value };
                              setEditingPage({ ...editingPage, blocks: newBlocks });
                            }}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            placeholder="Badge..."
                          />
                        </div>
                      </div>

                      {/* Text content if text or cta */}
                      {(block.type === "text" || block.type === "cta") && (
                        <div>
                          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1">
                            {block.type === "cta" ? "Subtitle Text" : "Body Text"}
                          </label>
                          <textarea
                            rows={3}
                            value={(block.type === "cta" ? block.subtitle : block.content) ?? ""}
                            onChange={(e) => {
                              const newBlocks = [...editingPage.blocks];
                              if (block.type === "cta") {
                                newBlocks[blkIdx] = { ...newBlocks[blkIdx], subtitle: e.target.value };
                              } else {
                                newBlocks[blkIdx] = { ...newBlocks[blkIdx], content: e.target.value };
                              }
                              setEditingPage({ ...editingPage, blocks: newBlocks });
                            }}
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="Enter detailed content..."
                          />
                        </div>
                      )}

                      {/* Items Manager for grid, stats, faq, timeline */}
                      {block.items && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-white/50">
                              Items / Cards ({block.items.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const newBlocks = [...editingPage.blocks];
                                const currentItems = newBlocks[blkIdx].items || [];
                                newBlocks[blkIdx].items = [
                                  ...currentItems,
                                  {
                                    title: "New Item",
                                    description: "Item description.",
                                    tag: "Featured",
                                    value: "100%",
                                  },
                                ];
                                setEditingPage({ ...editingPage, blocks: newBlocks });
                              }}
                              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 uppercase cursor-pointer"
                            >
                              + Add Item
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {block.items.map((item, itmIdx) => (
                              <div
                                key={itmIdx}
                                className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2.5 relative"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-mono text-cyan-400 font-bold">Item #{itmIdx + 1}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newBlocks = [...editingPage.blocks];
                                      newBlocks[blkIdx].items = (newBlocks[blkIdx].items || []).filter(
                                        (_, i) => i !== itmIdx
                                      );
                                      setEditingPage({ ...editingPage, blocks: newBlocks });
                                    }}
                                    className="text-white/30 hover:text-red-400 p-0.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={item.title ?? ""}
                                    onChange={(e) => {
                                      const newBlocks = [...editingPage.blocks];
                                      const newItems = [...(newBlocks[blkIdx].items || [])];
                                      newItems[itmIdx] = { ...newItems[itmIdx], title: e.target.value };
                                      newBlocks[blkIdx].items = newItems;
                                      setEditingPage({ ...editingPage, blocks: newBlocks });
                                    }}
                                    className="w-full bg-black/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                                    placeholder="Title"
                                  />
                                  <input
                                    type="text"
                                    value={item.tag ?? item.value ?? ""}
                                    onChange={(e) => {
                                      const newBlocks = [...editingPage.blocks];
                                      const newItems = [...(newBlocks[blkIdx].items || [])];
                                      newItems[itmIdx] = { ...newItems[itmIdx], tag: e.target.value, value: e.target.value };
                                      newBlocks[blkIdx].items = newItems;
                                      setEditingPage({ ...editingPage, blocks: newBlocks });
                                    }}
                                    className="w-full bg-black/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono"
                                    placeholder="Tag / Stat Value"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={item.description ?? ""}
                                  onChange={(e) => {
                                    const newBlocks = [...editingPage.blocks];
                                    const newItems = [...(newBlocks[blkIdx].items || [])];
                                    newItems[itmIdx] = { ...newItems[itmIdx], description: e.target.value };
                                    newBlocks[blkIdx].items = newItems;
                                    setEditingPage({ ...editingPage, blocks: newBlocks });
                                  }}
                                  className="w-full bg-black/80 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white/70"
                                  placeholder="Description..."
                                />

                                {/* Image selector for item */}
                                <div className="flex items-center gap-1.5 pt-1">
                                  {item.image && (
                                    <img src={item.image} alt="" className="w-7 h-7 rounded object-cover border border-white/10" />
                                  )}
                                  <input
                                    type="text"
                                    value={item.image ?? ""}
                                    onChange={(e) => {
                                      const newBlocks = [...editingPage.blocks];
                                      const newItems = [...(newBlocks[blkIdx].items || [])];
                                      newItems[itmIdx] = { ...newItems[itmIdx], image: e.target.value };
                                      newBlocks[blkIdx].items = newItems;
                                      setEditingPage({ ...editingPage, blocks: newBlocks });
                                    }}
                                    className="flex-1 bg-black/80 border border-white/10 rounded px-2 py-1 text-[10px] text-white font-mono"
                                    placeholder="Image URL..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setMediaPickerTarget({
                                        type: "custom-page-item",
                                        blockIndex: blkIdx,
                                        itemIndex: itmIdx,
                                      })
                                    }
                                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold cursor-pointer shrink-0"
                                  >
                                    <FolderOpen className="w-3 h-3 text-cyan-400" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#151722] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setEditingPage(null);
                  setIsCreatingPage(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSavePageModal}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save &amp; Publish Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
