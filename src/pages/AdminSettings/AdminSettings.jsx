// src/pages/AdminSettings/AdminSettings.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../data/api";

import { resolveImageUrl } from "../../utils/urlHelpers";

export default function AdminSettings() {
  const [me, setMe] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  // ... (rest of state items are unchanged, just importing resolveImageUrl at top and replacing src below)

  const [settings, setSettings] = useState({
    siteName: "",
    supportEmail: "",
    maintenanceMode: false,
    premiumPrice: 10,
    premiumCurrency: "USD",
    premiumPeriodMonths: 12,
    reportAutoFlagThreshold: 3,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileRef = useRef(null);

  const signGet = async (key) => {
    if (!key) return null;
    try {
      const { data } = await api.get("/files/sign", { params: { key } });
      return data?.url || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: meData } = await api.get("/users/me");
        if (!mounted) return;
        setMe(meData);

        if (meData?.avatarUrl) {
          setAvatarUrl(meData.avatarUrl);
        } else if (meData?.avatarKey) {
          setAvatarUrl(await signGet(meData.avatarKey));
        }

        const { data: s } = await api.get("/admin/settings");
        if (mounted) setSettings((prev) => ({ ...prev, ...(s || {}) }));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file
    if (!file || uploadingAvatar) return;

    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      alert("Please select a PNG or JPG image.");
      return;
    }

    try {
      setUploadingAvatar(true);

      // 1) Ask backend to presign and RETURN REQUIRED HEADERS
      // Expected shape: { url, key, headers?: { ... } }
      const { data: presign } = await api.get("/users/me/presign/avatar", {
        params: { contentType: file.type, size: file.size },
      });

      // 2) PUT to S3 with EXACT headers the presign expects
      const hdrs = new Headers();
      if (presign.headers && typeof presign.headers === "object") {
        for (const [k, v] of Object.entries(presign.headers)) {
          if (v != null && String(v).trim() !== "") hdrs.set(k, String(v));
        }
      }

      const signedHeaders =
        new URL(presign.url).searchParams.get("X-Amz-SignedHeaders") || "";
      if (
        signedHeaders.toLowerCase().includes("x-amz-server-side-encryption") &&
        !hdrs.has("x-amz-server-side-encryption")
      ) {
        hdrs.set("x-amz-server-side-encryption", "AES256");
      }

      // Add Content-Type only if not already signed
      if (!hdrs.has("Content-Type")) hdrs.set("Content-Type", file.type);

      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers: hdrs,
        body: file,
      });
      if (!putRes.ok) {
        const text = await putRes.text().catch(() => "");
        throw new Error(`S3 upload failed: ${putRes.status} ${text}`);
      }

      // 3) Tell backend which key to save on your user
      await api.post("/users/me/avatar", { fileKey: presign.key });

      // 4) Refresh me + preview
      const { data: meData } = await api.get("/users/me");
      setMe(meData);
      const nextUrl =
        meData.avatarUrl ||
        (meData.avatarKey ? await signGet(meData.avatarKey) : null);
      setAvatarUrl(nextUrl);

      alert("Avatar updated!");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error || err?.message || "Failed to update avatar"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      const payload = {
        siteName: settings.siteName,
        supportEmail: settings.supportEmail,
        maintenanceMode: !!settings.maintenanceMode,
        premiumPrice: Number(settings.premiumPrice) || 0,
        premiumCurrency: settings.premiumCurrency || "USD",
        premiumPeriodMonths: Number(settings.premiumPeriodMonths) || 12,
        reportAutoFlagThreshold: Number(settings.reportAutoFlagThreshold) || 3,
      };
      const { data } = await api.put("/admin/settings", payload);
      setSettings((prev) => ({ ...prev, ...(data || {}) }));
      alert("Settings saved.");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error || err?.message || "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="ad-shell">
        <div className="ad-wrap" style={{ maxWidth: 940 }}>
          <div className="ad-card" style={{ padding: 48, textAlign: "center" }}>
            <div className="ad-spinner" />
            <p style={{ marginTop: 14, color: "var(--ad-ink-faint)", fontSize: 14 }}>
              Loading settings…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-shell ad-page">
      <div className="ad-wrap ad-stagger" style={{ maxWidth: 940, display: "grid", gap: 20 }}>
        {/* Page header */}
        <div className="ad-hero">
          <div className="ad-hero__lead">
            <div className="ad-hero__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <p className="ad-eyebrow">Configuration</p>
              <h1 className="ad-hero__title">Settings</h1>
              <p className="ad-hero__sub">
                Manage your profile, platform configuration and premium plan.
              </p>
            </div>
          </div>
        </div>

        {/* Profile (avatar) */}
        <div className="ad-card">
          <div className="ad-card__head">
            <div>
              <h3 className="ad-card__title">Admin Profile</h3>
              <p className="ad-card__hint">Your photo appears across the admin area</p>
            </div>
          </div>
          <div className="ad-card__body" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div className="ad-settings-avatar">
              <img
                src={resolveImageUrl(avatarUrl) || "/placeholder.svg"}
                alt="avatar"
              />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>
                {me?.name || "Admin User"}
              </p>
              <p style={{ margin: "2px 0 14px", color: "var(--ad-ink-faint)", fontSize: 13.5 }}>
                {me?.email || "—"}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                style={{ display: "none" }}
                onChange={onPickAvatar}
                disabled={uploadingAvatar}
              />
              <button
                className="ad-btn ad-btn--ghost"
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? "Uploading…" : "Change Avatar"}
              </button>
            </div>
          </div>
        </div>

        {/* Site Settings */}
        <form className="ad-card" onSubmit={saveSettings}>
          <div className="ad-card__head">
            <div>
              <h3 className="ad-card__title">Site Settings</h3>
              <p className="ad-card__hint">General platform configuration</p>
            </div>
          </div>
          <div className="ad-card__body">
            <div className="ad-form-grid">
              <div className="ad-field" style={{ gridColumn: "span 6" }}>
                <label className="ad-label">Site Name</label>
                <input
                  className="ad-input"
                  value={settings.siteName || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
                  placeholder="Memorise"
                />
              </div>
              <div className="ad-field" style={{ gridColumn: "span 6" }}>
                <label className="ad-label">Support Email</label>
                <input
                  type="email"
                  className="ad-input"
                  value={settings.supportEmail || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
                  placeholder="support@example.com"
                />
              </div>

              <div className="ad-field" style={{ gridColumn: "span 4" }}>
                <label className="ad-label">Premium Price</label>
                <input
                  type="number"
                  className="ad-input"
                  value={settings.premiumPrice ?? 10}
                  onChange={(e) => setSettings((s) => ({ ...s, premiumPrice: e.target.value }))}
                  min={0}
                />
              </div>
              <div className="ad-field" style={{ gridColumn: "span 4" }}>
                <label className="ad-label">Currency</label>
                <select
                  className="ad-select"
                  value={settings.premiumCurrency || "INR"}
                  onChange={(e) => setSettings((s) => ({ ...s, premiumCurrency: e.target.value }))}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              <div className="ad-field" style={{ gridColumn: "span 4" }}>
                <label className="ad-label">Period (months)</label>
                <input
                  type="number"
                  className="ad-input"
                  value={settings.premiumPeriodMonths ?? 12}
                  onChange={(e) => setSettings((s) => ({ ...s, premiumPeriodMonths: e.target.value }))}
                  min={1}
                />
              </div>

              <div className="ad-field" style={{ gridColumn: "span 6" }}>
                <label className="ad-label">Auto-flag threshold</label>
                <input
                  type="number"
                  className="ad-input"
                  value={settings.reportAutoFlagThreshold ?? 3}
                  onChange={(e) => setSettings((s) => ({ ...s, reportAutoFlagThreshold: e.target.value }))}
                  min={1}
                />
              </div>

              <div style={{ gridColumn: "span 6", display: "flex", alignItems: "flex-end" }}>
                <div className="ad-maint">
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Maintenance mode</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--ad-ink-faint)" }}>
                      Temporarily take the platform offline
                    </p>
                  </div>
                  <label className="ad-switch">
                    <input
                      type="checkbox"
                      checked={!!settings.maintenanceMode}
                      onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))}
                    />
                    <span className="ad-switch__track" />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="ad-card__foot">
            <button className="ad-btn ad-btn--primary" disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
