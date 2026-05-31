"use client";
import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const BLUE    = "#2563EB";
const GRAY900 = "#111827";
const GRAY700 = "#374151";
const GRAY500 = "#6B7280";
const GRAY200 = "#E5E7EB";
const GRAY50  = "#F9FAFB";

/* ── Helpers ── */
function getInitials(name = "") {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
    : parts[0]?.slice(0, 2).toUpperCase() || "?";
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function authJsonHeaders() {
  return {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
}

/* ── Spinner ── */
function Spinner({ color = BLUE }) {
  return (
    <span style={{
      display: "inline-block", width: 12, height: 12,
      border: `2px solid ${color}33`, borderTop: `2px solid ${color}`,
      borderRadius: "50%", animation: "tb-spin 0.7s linear infinite", flexShrink: 0,
    }} />
  );
}

/* ── Toast ── */
function Toast({ message, type = "success", visible }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: type === "success" ? "#16A34A" : "#DC2626",
      color: "#fff", padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 500,
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.3s, transform 0.3s",
      pointerEvents: "none", zIndex: 999,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {type === "success" ? "✓" : "✕"} {message}
    </div>
  );
}

/* ── Confirm modal ── */
function ConfirmModal({ visible, title, message, onConfirm, onCancel, loading }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "28px 28px 24px",
        maxWidth: 400, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 600, color: GRAY900 }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: GRAY500, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={loading}
            style={{
              padding: "8px 16px", background: "#fff", color: GRAY700,
              border: `1px solid ${GRAY200}`, borderRadius: 8,
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            style={{
              padding: "9px 20px", background: "#DC2626", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}>
            {loading && <Spinner color="#fff" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Field ── */
function Field({ label, value, onChange, type = "text", disabled = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ flex: "1 1 200px", minWidth: 0 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: GRAY700, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange} disabled={disabled}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "9px 12px",
          border: `1px solid ${focused ? BLUE : GRAY200}`,
          borderRadius: 8, fontSize: 14, color: disabled ? GRAY500 : GRAY900,
          outline: "none", boxSizing: "border-box",
          background: disabled ? GRAY50 : "#fff",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

/* ── Card ── */
function Card({ children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${GRAY200}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
      {children}
    </div>
  );
}
function CardHead({ title, subtitle }) {
  return (
    <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #F3F4F6" }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: GRAY900 }}>{title}</h2>
      {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: GRAY500 }}>{subtitle}</p>}
    </div>
  );
}
function CardBody({ children }) {
  return <div style={{ padding: "20px 24px" }}>{children}</div>;
}
function CardFoot({ left, right }) {
  return (
    <div style={{
      padding: "14px 24px", background: GRAY50, borderTop: "1px solid #F3F4F6",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
    }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

/* ── Buttons ── */
function PrimaryBtn({ children, onClick, loading = false, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 20px",
        background: disabled || loading ? "#93C5FD" : hov ? "#1D4ED8" : BLUE,
        color: "#fff", border: "none", borderRadius: 8,
        fontSize: 14, fontWeight: 500, cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "background 0.15s", whiteSpace: "nowrap",
        display: "flex", alignItems: "center", gap: 6,
      }}>
      {loading && <Spinner color="#fff" />}
      {children}
    </button>
  );
}
function SecondaryBtn({ children, onClick, red = false, loading = false, disabled = false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled || loading}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 16px",
        background: hov ? (red ? "#FEF2F2" : GRAY50) : "#fff",
        color: red ? "#DC2626" : GRAY700,
        border: `1px solid ${red ? "#FCA5A5" : GRAY200}`,
        borderRadius: 8, fontSize: 13, fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        transition: "background 0.15s", whiteSpace: "nowrap",
        display: "flex", alignItems: "center", gap: 6,
        opacity: disabled ? 0.6 : 1,
      }}>
      {loading && <Spinner color={red ? "#DC2626" : GRAY500} />}
      {children}
    </button>
  );
}

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
export default function AccountSettings() {
  /* Profile */
  const [fullName,  setFullName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [avatarInitials, setAvatarInitials] = useState("--");
  // FIX: avatarUrl persists the real Cloudinary URL; avatarBg is only the
  // fallback initials-circle colour used when no photo has been uploaded.
  const [avatarUrl,  setAvatarUrl]  = useState(null);
  const [avatarBg,   setAvatarBg]   = useState("#DBEAFE");
  const [savingProfile, setSavingProfile] = useState(false);

  /* Business */
  const [company,      setCompany]      = useState("");
  const [domain,       setDomain]       = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [savingBiz,    setSavingBiz]    = useState(false);

  /* Loading state */
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBiz,     setLoadingBiz]     = useState(true);

  /* API key */
  const [apiKey,       setApiKey]       = useState("");
  const [apiVisible,   setApiVisible]   = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [lastUsed,     setLastUsed]     = useState("—");

  /* Modals & toasts */
  const [toast,         setToast]         = useState({ visible: false, message: "", type: "success" });
  const [regenModal,    setRegenModal]    = useState(false);
  const [regenLoading,  setRegenLoading]  = useState(false);
  const [removeModal,   setRemoveModal]   = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  /* ── Load profile on mount ── */
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me", { headers: authJsonHeaders() });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        const name = data.name || data.fullName || "";
        setFullName(name);
        setEmail(data.email || "");
        setAvatarInitials(getInitials(name));
        // FIX: restore saved avatar URL if one exists
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
      } catch {
        showToast("Could not load profile data.", "error");
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  /* ── Load business on mount ── */
  useEffect(() => {
    async function loadBusiness() {
      const businessId = localStorage.getItem("businessId");
      if (!businessId) { setLoadingBiz(false); return; }
      try {
        const res = await fetch(`/api/business/${businessId}`, { headers: authJsonHeaders() });
        if (!res.ok) throw new Error("Failed to load business");
        const data = await res.json();
        setCompany(data.name || data.businessName || "");
        setDomain(data.domain || data.website || "");
        setSupportEmail(data.supportEmail || "");
        if (data.apiKey) {
          setApiKey(data.apiKey);
          setLastUsed(data.apiKeyLastUsed || "—");
        }
      } catch {
        showToast("Could not load business data.", "error");
      } finally {
        setLoadingBiz(false);
      }
    }
    loadBusiness();
  }, []);

  /* ── Save profile ── */
  const handleSaveProfile = async () => {
    if (!fullName.trim()) { showToast("Full name cannot be empty.", "error"); return; }
    if (!email.trim() || !email.includes("@")) { showToast("Please enter a valid email.", "error"); return; }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: authJsonHeaders(),
        body: JSON.stringify({ name: fullName.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");
      setAvatarInitials(getInitials(fullName.trim()));
      showToast("Profile information saved successfully.");
    } catch (err) {
      showToast(err.message || "Failed to save profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Save business ── */
  const handleSaveBiz = async () => {
    // FIX: domain and supportEmail are optional — only company name is required.
    // Previously these blocked saving even a simple company name change.
    if (!company.trim()) { showToast("Company name cannot be empty.", "error"); return; }
    if (supportEmail.trim() && !supportEmail.includes("@")) {
      showToast("Please enter a valid support email address.", "error"); return;
    }
    const businessId = localStorage.getItem("businessId");
    if (!businessId) { showToast("Business ID not found. Please log in again.", "error"); return; }
    setSavingBiz(true);
    try {
      const res = await fetch(`/api/business/${businessId}`, {
        method: "PUT",
        headers: authJsonHeaders(),
        body: JSON.stringify({
          name: company.trim(),
          domain: domain.trim(),
          supportEmail: supportEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save business details");
      showToast("Business details saved successfully.");
    } catch (err) {
      showToast(err.message || "Failed to save business details.", "error");
    } finally {
      setSavingBiz(false);
    }
  };

  /* ── Avatar upload (FIX: real multipart upload to Cloudinary via backend) ── */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be smaller than 5 MB.", "error");
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/auth/me/avatar", {
        method:  "POST",
        headers: authHeaders(), // NOTE: no Content-Type — browser sets it with boundary
        body:    formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // Update state with the real Cloudinary URL
      setAvatarUrl(data.avatarUrl);
      showToast("Avatar updated successfully.");
    } catch (err) {
      showToast(err.message || "Avatar upload failed. Please try again.", "error");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  /* ── API key ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirmRegenerate = async () => {
    const businessId = localStorage.getItem("businessId");
    if (!businessId) { showToast("Business ID not found.", "error"); return; }
    setRegenLoading(true);
    try {
      const res = await fetch(`/api/business/${businessId}/regenerate-key`, {
        method: "POST",
        headers: authJsonHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to regenerate key");
      setApiKey(data.apiKey);
      setLastUsed("Just now");
      setApiVisible(true);
      setCopied(false);
      setRegenModal(false);
      showToast("New API key generated. Copy it now — it won't be shown again.");
    } catch (err) {
      showToast(err.message || "Failed to regenerate key.", "error");
    } finally {
      setRegenLoading(false);
    }
  };

  /* ── Remove avatar (FIX: real API call instead of just changing bg colour) ── */
  const confirmRemoveAvatar = async () => {
    setRemoveLoading(true);
    try {
      const res = await fetch("/api/auth/me/avatar", {
        method:  "DELETE",
        headers: authJsonHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove avatar");
      setAvatarUrl(null);
      setAvatarBg("#DBEAFE");
      setRemoveModal(false);
      showToast("Avatar removed.");
    } catch (err) {
      showToast(err.message || "Failed to remove avatar.", "error");
    } finally {
      setRemoveLoading(false);
    }
  };

  const maskedKey = apiKey
    ? "sk-live-" + "•".repeat(28) + apiKey.slice(-4)
    : "sk-live-" + "•".repeat(32);

  return (
    <DashboardLayout
      title="Account Settings"
      actions={<SecondaryBtn onClick={() => window.open("https://docs.talkbase.ai", "_blank")}>View Help Docs</SecondaryBtn>}
    >
      <style>{`@keyframes tb-spin { to { transform: rotate(360deg); } }`}</style>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />

      <ConfirmModal
        visible={regenModal} title="Regenerate API Key?"
        message="Your current API key will be permanently invalidated. Any widget using this key will stop working until updated."
        onConfirm={confirmRegenerate} onCancel={() => setRegenModal(false)} loading={regenLoading}
      />
      <ConfirmModal
        visible={removeModal} title="Remove Avatar?"
        message="Your profile avatar will be removed and replaced with initials."
        onConfirm={confirmRemoveAvatar} onCancel={() => setRemoveModal(false)} loading={removeLoading}
      />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <div style={{ maxWidth: 760, width: "100%" }}>

        {/* ── Profile ── */}
        <Card>
          <CardHead title="Profile Information" subtitle="Update your account details and profile picture." />
          <CardBody>
            {loadingProfile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: GRAY500, fontSize: 14, padding: "8px 0" }}>
                <Spinner /> Loading profile…
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
                  {/* FIX: show real photo if uploaded, otherwise show initials circle */}
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile avatar"
                      style={{
                        width: 58, height: 58, borderRadius: "50%",
                        objectFit: "cover", flexShrink: 0,
                        border: `2px solid ${GRAY200}`,
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 58, height: 58, borderRadius: "50%", background: avatarBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 700, color: BLUE, flexShrink: 0,
                    }}>
                      {avatarLoading ? <Spinner color={BLUE} /> : avatarInitials}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <SecondaryBtn onClick={() => fileInputRef.current?.click()} loading={avatarLoading}>
                      {avatarLoading ? "Uploading…" : "Change Avatar"}
                    </SecondaryBtn>
                    {avatarUrl && (
                      <SecondaryBtn red onClick={() => setRemoveModal(true)}>Remove</SecondaryBtn>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Field label="Full Name"     value={fullName}  onChange={e => setFullName(e.target.value)} />
                  <Field label="Email Address" value={email}     onChange={e => setEmail(e.target.value)} type="email" />
                </div>
              </>
            )}
          </CardBody>
          <CardFoot
            left={null}
            right={
              <PrimaryBtn onClick={handleSaveProfile} loading={savingProfile} disabled={loadingProfile}>
                {savingProfile ? "Saving…" : "Save Changes"}
              </PrimaryBtn>
            }
          />
        </Card>

        {/* ── Business ── */}
        <Card>
          <CardHead title="Business Details" subtitle="Manage how your business appears in the chatbot widget." />
          <CardBody>
            {loadingBiz ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: GRAY500, fontSize: 14, padding: "8px 0" }}>
                <Spinner /> Loading business details…
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                  <Field label="Company Name"   value={company} onChange={e => setCompany(e.target.value)} />
                  <Field label="Website Domain (optional)" value={domain}  onChange={e => setDomain(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Field label="Support Email (optional)" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} type="email" />
                </div>
              </>
            )}
          </CardBody>
          <CardFoot
            left={null}
            right={
              <PrimaryBtn onClick={handleSaveBiz} loading={savingBiz} disabled={loadingBiz}>
                {savingBiz ? "Saving…" : "Save Business Info"}
              </PrimaryBtn>
            }
          />
        </Card>

        {/* ── API Key ── */}
        <Card>
          <CardHead title="API Configuration" subtitle="Use this key to authenticate your chatbot widget on your website." />
          <CardBody>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: GRAY700, marginBottom: 8 }}>
              Secret API Key
            </label>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              border: `1px solid ${GRAY200}`, borderRadius: 8,
              background: GRAY50, padding: "10px 14px", flexWrap: "wrap",
            }}>
              <code style={{ flex: 1, minWidth: 0, fontSize: 13, color: GRAY700, fontFamily: "monospace", wordBreak: "break-all" }}>
                {loadingBiz ? "Loading…" : apiVisible ? apiKey : maskedKey}
              </code>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setApiVisible(v => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: GRAY500, fontSize: 15, padding: "2px 6px" }}>
                  {apiVisible ? "🙈" : "👁"}
                </button>
                <button onClick={handleCopy} disabled={!apiKey}
                  style={{
                    background: copied ? "#EFF6FF" : "#fff",
                    border: `1px solid ${copied ? "#BFDBFE" : GRAY200}`,
                    color: copied ? BLUE : GRAY700,
                    borderRadius: 6, fontSize: 12, fontWeight: 500,
                    padding: "4px 10px", cursor: apiKey ? "pointer" : "not-allowed",
                    opacity: apiKey ? 1 : 0.5, transition: "all 0.15s",
                  }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </CardBody>
          <CardFoot
            left={<span style={{ fontSize: 13, color: GRAY500 }}>Last used: {lastUsed}</span>}
            right={<SecondaryBtn onClick={() => setRegenModal(true)} loading={regenerating}>{regenerating ? "Generating…" : "Regenerate Key"}</SecondaryBtn>}
          />
        </Card>

      </div>
    </DashboardLayout>
  );
}
