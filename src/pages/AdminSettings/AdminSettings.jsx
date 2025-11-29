// src/pages/AdminSettings/AdminSettings.jsx
import { useEffect, useRef, useState } from "react";
import api from "../../data/api";

export default function AdminSettings() {
  const [me, setMe] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      <div className="container py-4">
        <div className="text-muted">Loading settings…</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Profile (avatar) */}
      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">Admin Profile</h5>
        </div>
        <div className="card-body d-flex align-items-center gap-3">
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt="avatar"
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #eee",
            }}
          />
          <div className="d-flex align-items-center gap-2">
            {/* keep input hidden; use the button to open it (prevents accidental file-reopen) */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg"
              className="d-none"
              onChange={onPickAvatar}
              disabled={uploadingAvatar}
            />
            <button
              className="btn btn-outline-secondary"
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
      <form className="card" onSubmit={saveSettings}>
        <div className="card-header">
          <h5 className="mb-0">Site Settings</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Site Name</label>
              <input
                className="form-control"
                value={settings.siteName || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, siteName: e.target.value }))
                }
                placeholder="Memorise"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Support Email</label>
              <input
                type="email"
                className="form-control"
                value={settings.supportEmail || ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, supportEmail: e.target.value }))
                }
                placeholder="support@example.com"
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Premium Price</label>
              <input
                type="number"
                className="form-control"
                value={settings.premiumPrice ?? 10}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    premiumPrice: e.target.value,
                  }))
                }
                min={0}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Currency</label>
              <input
                className="form-control"
                value={settings.premiumCurrency || "USD"}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    premiumCurrency: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Period (months)</label>
              <input
                type="number"
                className="form-control"
                value={settings.premiumPeriodMonths ?? 12}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    premiumPeriodMonths: e.target.value,
                  }))
                }
                min={1}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Auto-flag threshold</label>
              <input
                type="number"
                className="form-control"
                value={settings.reportAutoFlagThreshold ?? 3}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    reportAutoFlagThreshold: e.target.value,
                  }))
                }
                min={1}
              />
            </div>

            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="maint"
                  className="form-check-input"
                  type="checkbox"
                  checked={!!settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      maintenanceMode: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="maint" className="form-check-label ms-2">
                  Maintenance mode
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-end">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
