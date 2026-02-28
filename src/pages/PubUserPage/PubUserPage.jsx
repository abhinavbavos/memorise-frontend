// src/pages/Public/PubUserPage.jsx
import { Fragment, useEffect, useReducer, useState } from "react";
import {
  Button,
  Modal,
  Tab,
  Nav,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { IMAGES } from "../../data/constant/theme";
import { resolveImageUrl } from "../../utils/urlHelpers";
import api from "../../data/api";

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

  const getTrophyBadgeVariant = (c) =>
    c === "Academic" || c === "Academics"
      ? "primary"
      : c === "Sports"
        ? "danger"
        : c === "Leadership"
          ? "warning"
          : "success";

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
      <div className="p-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/profile/${publicId}`;

  return (
    <Fragment>
      {/* Header */}
      <div className="container">
        {/* cover + avatar */}
        <div className="profile card card-body px-3 pt-3 pb-0">
          <div className="profile-head">
            <div className="photo-content">
              <div
                className="cover-photo rounded position-relative"
                style={{
                  backgroundImage: user?.coverUrl
                    ? `url(${resolveImageUrl(user.coverUrl)})`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "200px",
                }}
              >
                <div
                  className="position-absolute"
                  style={{ bottom: 10, right: 10 }}
                >
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => dispatch({ type: "shareProfileModal" })}
                      title="Share Profile"
                    >
                      <i className="fa fa-share-alt" />
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => dispatch({ type: "reportUserModal" })}
                      title="Report User"
                    >
                      <i className="fa fa-flag" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-photo">
                <img
                  src={resolveImageUrl(user?.avatarUrl) || IMAGES.Profile}
                  className="img-fluid rounded-circle"
                  alt="profile"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
              </div>

              <div className="profile-details">
                <div className="profile-name px-3 pt-2">
                  <h4 className="text-primary mb-0">{user?.name || "User"}</h4>
                  <small className="text-muted">
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </small>
                </div>

                <div className="dropdown ms-auto flex justify-center gap-1">
                  <button
                    className="sendbtn sharp"
                    onClick={() => dispatch({ type: "shareProfileModal" })}
                    title="Share"
                  >
                    <i className="fa fa-share-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mt-3">
          <div className="card-body">
            <Tab.Container defaultActiveKey="MyTrophies">
              <Nav as="ul" className="nav nav-tabs mb-3">
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link eventKey="MyTrophies">Trophies</Nav.Link>
                </Nav.Item>
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link eventKey="About">About</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content className="pt-2">
                {/* My Trophies */}
                <Tab.Pane eventKey="MyTrophies">
                  <div className="d-flex flex-wrap justify-center gap-2 mb-4 pt-1">
                    {trophyCategories.map((c) => (
                      <Badge
                        key={c}
                        pill
                        bg={
                          selectedTrophyCategory === c
                            ? getTrophyBadgeVariant(c)
                            : "outline-secondary"
                        }
                        className={`cursor-pointer ${selectedTrophyCategory === c ? "" : "text-dark border"
                          }`}
                        onClick={() => setSelectedTrophyCategory(c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>

                  {filteredTrophies.length > 0 ? (
                    <div className="list-group">
                      {filteredTrophies.map((t, i) => (
                        <div
                          key={i}
                          className="list-group-item list-group-item-action border rounded mb-3 p-3 shadow-sm"
                        >
                          <div className="row align-items-center">
                            <div className="col-md-3 col-sm-4">
                              <img
                                className="img-fluid rounded"
                                src={resolveImageUrl(t.imageUrl) || IMAGES.Profile3}
                                alt={t.title}
                                style={{
                                  width: "100%",
                                  maxHeight: "150px",
                                  objectFit: "cover",
                                  cursor: "zoom-in"
                                }}
                                onClick={() => setPreviewTrophy(t)}
                              />
                            </div>
                            <div className="col-md-6 col-sm-5">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <h5 className="mb-0 text-dark">{t.title}</h5>
                                <Badge
                                  bg={getTrophyBadgeVariant(t.category)}
                                  className="ms-2"
                                >
                                  {t.category}
                                </Badge>
                              </div>
                              {t.year && (
                                <p className="text-muted mb-1">
                                  <i className="fa fa-calendar me-2"></i>
                                  {t.year}
                                </p>
                              )}
                              {t.description && (
                                <p className="text-muted small mb-0">{t.description}</p>
                              )}
                            </div>
                            <div className="col-md-3 col-sm-3 text-end">
                              <div className="d-flex flex-column gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => setPreviewTrophy(t)}
                                  title="View trophy"
                                >
                                  <i className="fa fa-eye me-1"></i>
                                  View
                                </button>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    const imageUrl = resolveImageUrl(t.imageUrl);
                                    handleDownloadImage(imageUrl, t.title);
                                  }}
                                  title="Download trophy"
                                >
                                  <i className="fa fa-download me-1"></i>
                                  Download
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-warning"
                                  onClick={() => handleReportTrophy(t)}
                                  title="Report trophy"
                                >
                                  <i className="fa fa-flag me-1"></i>
                                  Report
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No trophies found.</p>
                    </div>
                  )}
                </Tab.Pane>

                {/* About */}
                <Tab.Pane eventKey="About">
                  <div className="pt-4">
                    {/* About Me */}
                    <div className="border-bottom pb-3 mb-4">
                      <h4 className="text-primary mb-3">About Me</h4>
                      <p className="mb-0">{user?.about || user?.info?.about || "No information provided."}</p>
                    </div>

                    {/* Skills */}
                    {((user?.skills || user?.info?.skills || []).length > 0) && (
                      <div className="mb-4">
                        <h4 className="text-primary mb-3">Skills</h4>
                        <div className="d-flex flex-wrap gap-2">
                          {(user?.skills || user?.info?.skills || []).map((skill, index) => (
                            <span
                              key={index}
                              className="badge bg-primary-subtle text-primary border border-primary px-3 py-2"
                              style={{ fontSize: "0.9rem", fontWeight: "500" }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {((user?.languages || user?.info?.languages || []).length > 0) && (
                      <div className="mb-4">
                        <h4 className="text-primary mb-3">Languages</h4>
                        <div className="d-flex flex-wrap gap-3">
                          {(user?.languages || user?.info?.languages || []).map((language, index) => (
                            <span
                              key={index}
                              className="text-muted"
                              style={{ fontSize: "1rem" }}
                            >
                              <i className="fa fa-language me-2 text-primary"></i>
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personal Information */}
                    <div className="profile-personal-info">
                      <h4 className="text-primary mb-4">Personal Information</h4>
                      <div className="row mb-2">
                        <div className="col-sm-3">
                          <h5 className="f-w-500">
                            Name<span className="pull-right">:</span>
                          </h5>
                        </div>
                        <div className="col-sm-9">
                          <span>{user?.name || "-"}</span>
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-sm-3">
                          <h5 className="f-w-500">
                            Age<span className="pull-right">:</span>
                          </h5>
                        </div>
                        <div className="col-sm-9">
                          <span>{user?.age || "-"}</span>
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-sm-3">
                          <h5 className="f-w-500">
                            Location<span className="pull-right">:</span>
                          </h5>
                        </div>
                        <div className="col-sm-9">
                          <span>
                            {user?.city || user?.location?.city || ""}
                            {(user?.country || user?.location?.country) &&
                              `, ${user?.country || user?.location?.country}`}
                            {!(user?.city || user?.location?.city || user?.country || user?.location?.country) && "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
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
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {reportedTrophy ? "Report Trophy" : "Report User"}
            </h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => {
                if (state.reportUser) dispatch({ type: "reportUserModal" });
                if (state.reportTrophy) dispatch({ type: "reportTrophyModal" });
              }}
            />
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Reason</label>
              <select
                className="form-select"
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
            <div>
              <label className="form-label">Message (optional)</label>
              <textarea
                className="form-control"
                rows={4}
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={() => {
                if (state.reportUser) dispatch({ type: "reportUserModal" });
                if (state.reportTrophy) dispatch({ type: "reportTrophyModal" });
              }}
            >
              Cancel
            </Button>
            <Button variant="warning" onClick={submitReport}>
              <i className="fa fa-flag me-1" />
              Submit
            </Button>
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
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{previewTrophy?.title || "Trophy"}</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => setPreviewTrophy(null)}
            />
          </div>
          <div className="modal-body text-center">
            {previewTrophy && (
              <img
                src={resolveImageUrl(previewTrophy.imageUrl) || IMAGES.Profile3}
                alt={previewTrophy.title || "Trophy"}
                className="img-fluid rounded"
                style={{ maxHeight: "70vh", objectFit: "contain" }}
              />
            )}
          </div>
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
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share Profile</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => {
                dispatch({ type: "shareProfileModal" });
                setCopiedUrl(false);
              }}
            />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Profile URL</label>
              <div className="input-group">
                <input
                  type="text"
                  readOnly
                  className="form-control"
                  value={shareUrl}
                />
                <button
                  className="btn"
                  style={{
                    background: copiedUrl ? "#28a745" : "#0052cc",
                    color: "white",
                    borderColor: copiedUrl ? "#28a745" : "#0052cc",
                    transition: "all 0.3s ease",
                    minWidth: "80px",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2000);
                  }}
                >
                  {copiedUrl ? (
                    <>
                      <i className="fa fa-check me-1"></i>Copied!
                    </>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </div>
            <div className="text-center">
              <p className="mb-3 fw-semibold">Share on social media:</p>
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
