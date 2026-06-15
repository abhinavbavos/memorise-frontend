// src/pages/Public/PubUserPage.jsx
import { Fragment, useEffect, useReducer, useState } from "react";
import { Modal, Tab, Nav } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { IMAGES } from "../../data/constant/theme";
import { resolveImageUrl } from "../../utils/urlHelpers";
import api from "../../data/api";
import { Ic } from "../../components/Data/profileIcons";

const initialState = {
  reportUser: false,
  reportTrophy: false,
  shareProfile: false,
};

function reducer(state, action) {
  return {
    ...state,
    [action.type.replace("Modal", "")]:
      !state[action.type.replace("Modal", "")],
  };
}

export default function PubUserPage() {
  const { publicId } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [trophies, setTrophies] = useState([]);

  const [reportedTrophy, setReportedTrophy] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [previewTrophy, setPreviewTrophy] = useState(null);

  const [selectedTrophyCategory, setSelectedTrophyCategory] = useState("All");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Load public profile + trophies
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // 1) public profile (includes avatarUrl/coverUrl & _id)
        const { data: pub } = await api.get(`/users/public/${publicId}`);
        if (cancelled) return;
        setUser(pub);

        // 2) trophies for that user
        const uid = pub?._id || pub?.id;
        if (!uid) throw new Error("Invalid public profile response");

        const { data: trophiesRes } = await api.get(`/trophies/user/${uid}`);

        if (cancelled) return;
        setTrophies(Array.isArray(trophiesRes) ? trophiesRes : []);
      } catch (e) {
        console.error("Public profile load failed", e);
        if (!cancelled) {
          setTrophies([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const trophyCategories = [
    "All",
    ...new Set((trophies || []).map((t) => t.category).filter(Boolean)),
  ];

  const filteredTrophies =
    selectedTrophyCategory === "All"
      ? trophies
      : trophies.filter((t) => t.category === selectedTrophyCategory);

  const handleDownloadImage = async (imageUrl, title) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();

      // Determine MIME type from URL or blob
      let mimeType = blob.type || "image/png";
      if (!mimeType || mimeType === "application/octet-stream") {
        if (imageUrl.includes(".jpg") || imageUrl.includes(".jpeg")) {
          mimeType = "image/jpeg";
        } else if (imageUrl.includes(".png")) {
          mimeType = "image/png";
        } else if (imageUrl.includes(".gif")) {
          mimeType = "image/gif";
        } else if (imageUrl.includes(".webp")) {
          mimeType = "image/webp";
        }
      }

      // Create blob with correct MIME type
      const typedBlob = new Blob([blob], { type: mimeType });

      // Get file extension from MIME type
      const ext = mimeType.split("/")[1] || "png";

      // Create filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${title || "trophy"}-${timestamp}.${ext}`;

      // Download
      const url = URL.createObjectURL(typedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image");
    }
  };



  const handleReportTrophy = (trophy) => {
    setReportedTrophy(trophy);
    dispatch({ type: "reportTrophyModal" });
  };

  const submitReport = async () => {
    if (!user && !reportedTrophy) return;
    try {
      let reportType = "user";
      let targetId = user._id || user.id;

      if (reportedTrophy) {
        reportType = "trophy";
        targetId = reportedTrophy.id || reportedTrophy._id;
      }

      await api.post("/reports", {
        type: reportType,
        targetId: targetId,
        reason: reportReason || "other",
        details: reportMessage || "",
      });
      // close modals + reset
      if (state.reportUser) dispatch({ type: "reportUserModal" });
      if (state.reportTrophy) dispatch({ type: "reportTrophyModal" });
      setReportReason("");
      setReportMessage("");
      setReportedTrophy(null);
      alert("Thank you for your report. We'll review it shortly.");
    } catch (e) {
      alert(e?.response?.data?.error || "Failed to submit report");
    }
  };

  if (loading) {
    return (
      <div className="pf-shell">
        <div className="ad-card" style={{ padding: "64px 20px" }}>
          <div className="ad-spinner" />
          <p className="ad-state__sub" style={{ textAlign: "center", marginTop: 14 }}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/profile/${publicId}`;

  const isPremium = (user?.plan || "").toLowerCase() === "premium";
  const hasCover = !!user?.coverUrl;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "";
  const place = [
    user?.city || user?.location?.city,
    user?.country || user?.location?.country,
  ].filter(Boolean).join(", ");
  const about = user?.about || user?.info?.about || "";
  const skills = user?.skills || user?.info?.skills || [];
  const languages = user?.languages || user?.info?.languages || [];
  const categoriesCount = Math.max(0, trophyCategories.length - 1);

  const closeReport = () => {
    if (state.reportUser) dispatch({ type: "reportUserModal" });
    if (state.reportTrophy) dispatch({ type: "reportTrophyModal" });
  };

  return (
    <Fragment>
      <div className="pf-shell ad-page">
        <div className="pf-stack">
          {/* Header */}
          <div className="pf-hero">
            <div
              className={`pf-cover ${hasCover ? "" : "pf-cover--fallback"}`}
              style={hasCover ? { backgroundImage: `url(${resolveImageUrl(user.coverUrl)})` } : undefined}
            >
              <div className="pf-cover__scrim" />
              <div className="pf-cover__actions">
                <button className="pf-glass" onClick={() => dispatch({ type: "shareProfileModal" })} title="Share profile">
                  {Ic.share}
                  <span className="d-none d-sm-inline">Share</span>
                </button>
                <button
                  className="pf-glass pf-glass--square pf-glass--warn"
                  onClick={() => dispatch({ type: "reportUserModal" })}
                  title="Report user"
                >
                  {Ic.flag}
                </button>
              </div>
            </div>

            <div className="pf-hero__body">
              <div className="pf-avatar">
                <img
                  src={resolveImageUrl(user?.avatarUrl) || IMAGES.Profile}
                  alt={user?.name || "profile"}
                />
              </div>

              <div className="pf-idblock">
                <div className="pf-name">
                  <h1>{user?.name || "User"}</h1>
                  {isPremium && <span className="pf-plan pf-plan--premium">{Ic.crown} Premium</span>}
                </div>
                <div className="pf-meta">
                  {place && <span className="pf-meta__item">{Ic.pin}{place}</span>}
                  {memberSince && <span className="pf-meta__item">{Ic.calendar}Member since {memberSince}</span>}
                </div>
              </div>

              <div className="pf-hero__cta">
                <button className="ad-btn ad-btn--ghost" onClick={() => dispatch({ type: "shareProfileModal" })}>
                  {Ic.share} Share
                </button>
                <button className="ad-btn ad-btn--ghost" onClick={() => dispatch({ type: "reportUserModal" })}>
                  {Ic.flag} Report
                </button>
              </div>
            </div>
          </div>

          {/* KPI strip */}
          <div className="pf-kpis">
            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--amber">{Ic.trophy}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Trophies</p>
                <p className="ad-stat__value">{trophies.length}</p>
              </div>
            </div>
            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--green">{Ic.layers}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Categories</p>
                <p className="ad-stat__value">{categoriesCount}</p>
              </div>
            </div>
            <div className="ad-stat">
              <div className="ad-stat__icon ad-stat__icon--blue">{Ic.calendar}</div>
              <div className="ad-stat__body">
                <p className="ad-stat__label">Member since</p>
                <p className="ad-stat__value" style={{ fontSize: 20 }}>{memberSince || "—"}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="ad-card">
            <div className="ad-card__body pf-tabs">
              <Tab.Container defaultActiveKey="MyTrophies">
                <Nav as="ul" className="nav nav-tabs">
                  <Nav.Item as="li" className="nav-item">
                    <Nav.Link eventKey="MyTrophies">{Ic.trophy} Trophies</Nav.Link>
                  </Nav.Item>
                  <Nav.Item as="li" className="nav-item">
                    <Nav.Link eventKey="About">{Ic.user} About</Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  {/* My Trophies */}
                  <Tab.Pane eventKey="MyTrophies">
                    {trophyCategories.length > 1 && (
                      <div className="pf-filterbar">
                        {trophyCategories.map((c) => (
                          <button
                            key={c}
                            className={`pf-fbtn ${selectedTrophyCategory === c ? "pf-fbtn--active" : ""}`}
                            onClick={() => setSelectedTrophyCategory(c)}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredTrophies.length > 0 ? (
                      <div className="pf-trophies">
                        {filteredTrophies.map((t, i) => {
                          const img = resolveImageUrl(t.imageUrl) || IMAGES.Profile3;
                          return (
                            <div key={i} className="pf-trophy">
                              <div className="pf-trophy__media" onClick={() => setPreviewTrophy(t)}>
                                {t.category && <span className="pf-trophy__cat pf-tagbadge">{t.category}</span>}
                                <img src={img} alt={t.title} />
                              </div>
                              <div className="pf-trophy__body">
                                <h3 className="pf-trophy__title">{t.title}</h3>
                                {t.year && <span className="pf-trophy__meta">{Ic.calendar}{t.year}</span>}
                                {t.description && <p className="pf-trophy__desc">{t.description}</p>}
                              </div>
                              <div className="pf-trophy__foot">
                                <button className="ad-btn ad-btn--ghost ad-btn--sm" onClick={() => setPreviewTrophy(t)}>
                                  {Ic.eye} View
                                </button>
                                <button
                                  className="ad-btn ad-btn--primary ad-btn--sm"
                                  onClick={() => handleDownloadImage(img, t.title)}
                                >
                                  {Ic.download} Save
                                </button>
                                <button
                                  className="ad-btn ad-btn--ghost ad-btn--sm"
                                  onClick={() => handleReportTrophy(t)}
                                  title="Report trophy"
                                  style={{ flex: "0 0 auto" }}
                                >
                                  {Ic.flag}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ad-state">
                        {Ic.trophy}
                        <p className="ad-state__title">No trophies found</p>
                        <p className="ad-state__sub">This user hasn't added any achievements in this category.</p>
                      </div>
                    )}
                  </Tab.Pane>

                  {/* About */}
                  <Tab.Pane eventKey="About">
                    <div className="pf-section">
                      <h3 className="pf-section__title">{Ic.user} About Me</h3>
                      <p className="pf-prose">{about || "No information provided."}</p>
                    </div>

                    {skills.length > 0 && (
                      <div className="pf-section">
                        <h3 className="pf-section__title">{Ic.sparkles} Skills</h3>
                        <div className="pf-chips">
                          {skills.map((skill, index) => (
                            <span key={index} className="pf-chip">{Ic.check} {skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {languages.length > 0 && (
                      <div className="pf-section">
                        <h3 className="pf-section__title">{Ic.globe} Languages</h3>
                        <div className="pf-chips">
                          {languages.map((language, index) => (
                            <span key={index} className="pf-chip pf-chip--lang">{Ic.globe} {language}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pf-section">
                      <h3 className="pf-section__title">{Ic.info} Personal Information</h3>
                      <div className="pf-info">
                        <div className="pf-info__cell">
                          <span className="pf-info__k">{Ic.user} Name</span>
                          <span className="pf-info__v">{user?.name || "—"}</span>
                        </div>
                        <div className="pf-info__cell">
                          <span className="pf-info__k">{Ic.user} Age</span>
                          <span className="pf-info__v">{user?.age || "—"}</span>
                        </div>
                        <div className="pf-info__cell">
                          <span className="pf-info__k">{Ic.pin} Location</span>
                          <span className="pf-info__v">{place || "—"}</span>
                        </div>
                        <div className="pf-info__cell">
                          <span className="pf-info__k">{Ic.calendar} Member since</span>
                          <span className="pf-info__v">{memberSince || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </div>
          </div>
        </div>
      </div>

      {/* Report User/Trophy Modal */}
      <Modal
        className="modal fade"
        show={state.reportUser || state.reportTrophy}
        onHide={() => {
          if (state.reportUser) dispatch({ type: "reportUserModal" });
          if (state.reportTrophy) dispatch({ type: "reportTrophyModal" });
        }}
        centered
      >
        <div className="ad-modal">
          <div className="ad-modal__head">
            <h3 className="ad-modal__title">{reportedTrophy ? "Report trophy" : "Report user"}</h3>
            <button className="ad-modal__close" onClick={closeReport}>{Ic.x}</button>
          </div>
          <div className="ad-modal__body">
            <div className="ad-field" style={{ marginBottom: 16 }}>
              <label className="ad-label">Reason</label>
              <select
                className="ad-select"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="spam">Spam</option>
                <option value="copyright">Copyright</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="ad-field">
              <label className="ad-label">Message (optional)</label>
              <textarea
                className="ad-input"
                rows={4}
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
              />
            </div>
          </div>
          <div className="ad-modal__foot">
            <button className="ad-btn ad-btn--ghost" onClick={closeReport}>Cancel</button>
            <button className="ad-btn ad-btn--danger" onClick={submitReport}>{Ic.flag} Submit report</button>
          </div>
        </div>
      </Modal>

      <Modal
        className="modal fade"
        show={!!previewTrophy}
        onHide={() => setPreviewTrophy(null)}
        centered
        size="lg"
      >
        <div className="ad-modal">
          <div className="ad-modal__head">
            <h3 className="ad-modal__title">{previewTrophy?.title || "Trophy"}</h3>
            <button className="ad-modal__close" onClick={() => setPreviewTrophy(null)}>{Ic.x}</button>
          </div>
          <div className="ad-modal__body" style={{ textAlign: "center" }}>
            {previewTrophy && (
              <img
                src={resolveImageUrl(previewTrophy.imageUrl) || IMAGES.Profile3}
                alt={previewTrophy.title || "Trophy"}
                style={{ maxHeight: "70vh", maxWidth: "100%", objectFit: "contain", borderRadius: 14 }}
              />
            )}
          </div>
          {previewTrophy && (
            <div className="ad-modal__foot">
              <button
                className="ad-btn ad-btn--primary"
                onClick={() => handleDownloadImage(resolveImageUrl(previewTrophy.imageUrl), previewTrophy.title)}
              >
                {Ic.download} Download
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Share Profile Modal */}
      <Modal
        className="modal fade"
        show={state.shareProfile}
        onHide={() => {
          dispatch({ type: "shareProfileModal" });
          setCopiedUrl(false);
        }}
        centered
      >
        <div className="ad-modal">
          <div className="ad-modal__head">
            <h3 className="ad-modal__title">Share profile</h3>
            <button
              className="ad-modal__close"
              onClick={() => {
                dispatch({ type: "shareProfileModal" });
                setCopiedUrl(false);
              }}
            >
              {Ic.x}
            </button>
          </div>
          <div className="ad-modal__body">
            <div className="ad-field" style={{ marginBottom: 22 }}>
              <label className="ad-label">Profile URL</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" readOnly className="ad-input" value={shareUrl} />
                <button
                  className={`ad-btn ${copiedUrl ? "ad-btn--primary" : "ad-btn--ghost"}`}
                  style={{ flexShrink: 0 }}
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                >
                  {copiedUrl ? <>{Ic.check} Copied</> : <>{Ic.copy} Copy</>}
                </button>
              </div>
            </div>
            <div className="text-center">
              <p className="ad-card__hint" style={{ marginBottom: 14 }}>Share on social media</p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <a
                  className="btn btn-sm"
                  style={{
                    background: "#3b5998",
                    color: "white",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 89, 152, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fab fa-facebook-f"></i> Facebook
                </a>
                <a
                  className="btn btn-sm"
                  style={{
                    background: "#1DA1F2",
                    color: "white",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(29, 161, 242, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fab fa-twitter"></i> Twitter
                </a>
                <a
                  className="btn btn-sm"
                  style={{
                    background: "#0052cc",
                    color: "white",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 82, 204, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fab fa-linkedin"></i> LinkedIn
                </a>
                <a
                  className="btn btn-sm"
                  style={{
                    background: "#25D366",
                    color: "white",
                    border: "none",
                    transition: "all 0.2s ease",
                  }}
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 211, 102, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <i className="fab fa-whatsapp"></i> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
}
