import { Fragment, useReducer, useState, useEffect } from "react";
import api from "../../data/api";
import { Button, Modal, Tab, Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import profile from "../../assets/images/profile/profile.png";
import ProfileHeader from "../../components/Data/ProfileHeader";
import PostList from "../../components/Data/PostList";
import TrophyList from "../../components/Data/TrophyList";
import ProfileSettings from "../../components/Data/ProfileSettings";
import CameraModal from "../../components/Modals/CameraModal";
import CreatePostModal from "../../components/Modals/CreatePostModal";

const initialState = {
  sendMessage: false,
  post: false,
  shareProfile: false,
  camera: false,
  reply: false,
  postDetail: false,
  coverPhotoUpload: false,
  avatarUpload: false,
  subscription: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "sendMessage":
    case "postModal":
    case "shareProfileModal":
    case "cameraModal":
    case "replyModal":
    case "postDetailModal":
    case "coverPhotoUploadModal":
    case "avatarUploadModal":
    case "subscriptionModal":
      return {
        ...state,
        [action.type.replace("Modal", "")]:
          !state[action.type.replace("Modal", "")],
      };
    default:
      return state;
  }
};

function UserPage() {
  const [selectedPost, setSelectedPost] = useState(null);

  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Posts");

  // Cover
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [selectedTrophyCategory, setSelectedTrophyCategory] = useState("All");

  // Server data
  const [me, setMe] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [categories, setCategories] = useState([
    "Awards",
    "Certificates",
    "Academics",
    "Sports",
    "Internship",
    "Others",
  ]);

  const [upgrading, setUpgrading] = useState(false);

  const onInit = () => { };
  const [state, dispatch] = useReducer(reducer, initialState);


  // Force the exact headers S3 needs for PUTs (SSE-S3 + Content-Type)
  const s3PutHeaders = (contentType, requiredHeaders = {}) => {
    const h = {
      "Content-Type": contentType || "application/octet-stream",
      ...requiredHeaders,
    };
    if (!h["x-amz-server-side-encryption"]) {
      h["x-amz-server-side-encryption"] = "AES256";
    }
    return h;
  };






  // helper to sign GET for any S3 key
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
    const qs = new URLSearchParams(location.search);
    const t = qs.get("tab");
    // keys must match your Nav.Link eventKey values exactly:
    const allowed = new Set(["Posts", "Trophies", "About", "Setting"]);
    setActiveTab(allowed.has(t) ? t : "Posts");
  }, [location.search]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: meData } = await api.get("/users/me");
        if (cancelled) return;

        setMe(meData);


        // avatar/cover URLs
        if (meData.avatarUrl) setAvatarUrl(meData.avatarUrl);
        else if (meData.avatarKey) setAvatarUrl(await signGet(meData.avatarKey));

        if (meData.coverUrl) setCoverPhotoPreview(meData.coverUrl);
        else if (meData.coverKey) {
          const curl = await signGet(meData.coverKey);
          if (curl) setCoverPhotoPreview(curl);
        }

        // posts + categories
        const [postsRes, catsRes] = await Promise.all([
          api.get("/posts/me"),
          api.get("/meta/categories").catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;
        setMyPosts(
          Array.isArray(postsRes.data)
            ? postsRes.data
            : postsRes.data.items || []
        );
        if (Array.isArray(catsRes.data) && catsRes.data.length)
          setCategories(catsRes.data);
      } catch (e) {
        console.error("init load failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!me?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/trophies/user/${me._id}`);
        if (!cancelled) setTrophies(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("trophies load failed", e);
        if (!cancelled) setTrophies([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me?._id]);

  const refreshPosts = async () => {
    const { data } = await api.get("/posts/me");
    setMyPosts(Array.isArray(data) ? data : data.items || []);
  };

  const refreshTrophies = async () => {
    if (!me?._id) return;
    try {
      const { data } = await api.get(`/trophies/user/${me._id}`);
      setTrophies(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("trophies refresh failed", e);
    }
  };

  // call both on create
  const handlePostCreated = async () => {
    await Promise.all([refreshPosts(), refreshTrophies()]);
  };

  const handleDeleteTrophy = async (trophyId) => {
    if (!window.confirm("Are you sure you want to delete this trophy?")) return;
    try {
      await api.delete(`/posts/${trophyId}`); // Assuming /posts/:id is the endpoint
      // optimistically remove or refresh
      setTrophies((prev) => prev.filter((t) => t._id !== trophyId));
      setMyPosts((prev) => prev.filter((p) => p._id !== trophyId));
      alert("Trophy deleted");
    } catch (e) {
      console.error(e);
      alert("Failed to delete trophy");
    }
  };

  const refreshMe = async () => {
    const { data } = await api.get("/users/me");
    setMe(data);

    // refresh avatar & cover urls too
    if (data?.avatarKey) setAvatarUrl(await signGet(data.avatarKey));
    if (data?.coverKey && !coverPhoto) {
      const curl = await signGet(data.coverKey);
      if (curl) setCoverPhotoPreview(curl);
    }
  };

  // Post click
  const handlePostClick = (post) => {
    setSelectedPost(post);
    dispatch({ type: "postDetailModal" });
  };

  // Cover handlers
  const handleCoverPhotoUploadClick = () => {
    // Cover photo upload is now free for all users
    dispatch({ type: "coverPhotoUploadModal" });
  };
  const handleCoverPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleCoverPhotoUpload = async () => {
    if (!coverPhoto) return;
    try {
      const { data: presign } = await api.get("/users/me/presign/cover", {
        params: { contentType: coverPhoto.type, size: coverPhoto.size },
      });

      const headers = s3PutHeaders(coverPhoto.type, presign.requiredHeaders);

      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers,
        body: coverPhoto,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => "");
        throw new Error(
          `S3 PUT (cover) failed: ${putRes.status} ${putRes.statusText}\n${errText}`
        );
      }

      const { data: updated } = await api.post("/users/me/cover", {
        fileKey: presign.key,
      });
      setMe(updated);
      dispatch({ type: "coverPhotoUploadModal" });
      setCoverPhoto(null);

      // refresh signed GET
      const curl = await signGet(presign.key);
      if (curl) setCoverPhotoPreview(curl);

      alert("Cover photo updated!");
    } catch (e) {
      console.error("cover upload failed", e);
      alert(e?.response?.data?.error || e?.message || "Upload failed");
    }
  };

  // Avatar handlers
  const handleAvatarPick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const r = new FileReader();
    r.onload = (ev) => setAvatarPreview(ev.target.result);
    r.readAsDataURL(f);
  };
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    try {
      const { data: presign } = await api.get("/users/me/presign/avatar", {
        params: { contentType: avatarFile.type, size: avatarFile.size },
      });
      if (!presign?.url || !presign?.key) throw new Error("No upload URL");

      const headers = s3PutHeaders(avatarFile.type, presign.requiredHeaders);

      // Fallback: if URL says SSE is required but server forgot to include it
      if (
        presign.url.includes("x-amz-server-side-encryption") &&
        !("x-amz-server-side-encryption" in headers)
      ) {
        headers["x-amz-server-side-encryption"] = "AES256";
      }

      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers,
        body: avatarFile,
      });
      if (!putRes.ok) {
        const t = await putRes.text().catch(() => "");
        throw new Error(
          `S3 PUT (avatar) failed: ${putRes.status} ${putRes.statusText}\n${t}`
        );
      }

      await api.post("/users/me/avatar", {
        fileKey: presign.key,
      });

      // refresh me and pick the URL the server returns
      const { data: meNow } = await api.get("/users/me");
      setMe(meNow);

      // use server-signed URL if present; otherwise sign locally as fallback
      if (meNow.avatarUrl) {
        setAvatarUrl(meNow.avatarUrl);
      } else {
        const aurl = await signGet(meNow.avatarKey || presign.key);
        setAvatarUrl(aurl);
      }

      setAvatarFile(null);
      setAvatarPreview(null);
      dispatch({ type: "avatarUploadModal" });
    } catch (e) {
      console.error("avatar upload failed", e);
      alert(e?.response?.data?.error || e?.message || "Avatar upload failed");
    }
  };

  // Upgrade (mock)
  const handleSubscriptionUpgrade = async () => {
    try {
      setUpgrading(true);
      const { data: session } = await api.post("/billing/checkout-session", {
        plan: "premium",
      });
      await api.post("/billing/mock/complete", {
        sessionId: session.sessionId,
      });
      await refreshMe();
      dispatch({ type: "subscriptionModal" });
      alert("You're Premium now ✨");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Upgrade failed");
    } finally {
      setUpgrading(false);
    }
  };


  const handleUpdateProfile = async (updatedData) => {
    try {
      const { data } = await api.put("/users/me", {
        name: updatedData.name,
        email: updatedData.email,
        about: updatedData.about,
        age: updatedData.age ? Number(updatedData.age) : undefined,
        city: updatedData.city,
        country: updatedData.country,
        skills: updatedData.skills,
        languages: updatedData.languages,
      });
      setMe(data);
      alert("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Update failed");
    }
  };

  const handlePasswordChange = async (pwData) => {
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      alert("Password changed");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Change password failed");
    }
  };


  // Post modal helpers (existing upload flow)


  // Derived UI model
  const user = {
    name: me?.name || "Your Name",
    desig: "Freelancer",
    age: me?.age ?? "",
    email: me?.email || "",
    location: {
      city: me?.city || "",
      country: me?.country || "",
    },
    plan: (me?.plan || "").toLowerCase() === "premium" ? "Premium" : "Basic Plan",
    info: {
      about: me?.about || "",
      skills: me?.skills || [],
      languages: me?.languages || [],
    },
  };

  const trophyCategories = [
    "All",
    ...new Set((trophies || []).map((t) => t.category)),
  ];
  const filteredTrophies =
    selectedTrophyCategory === "All"
      ? trophies
      : trophies.filter((t) => t.category === selectedTrophyCategory);

  const getTrophyBadgeVariant = (category) => {
    switch (category) {
      case "Academic":
      case "Academics":
        return "primary";
      case "Sports":
        return "danger";
      case "Leadership":
        return "warning";
      case "Community":
      case "Certificates":
      case "Awards":
      case "Internship":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Fragment>
      <div className="container">
        {/* Header */}
        {/* Header */}
        <ProfileHeader
          user={user}
          coverUrl={coverPhotoPreview}
          avatarUrl={avatarPreview || avatarUrl}
          onCoverUpload={handleCoverPhotoUploadClick}
          onAvatarUpload={() => dispatch({ type: "avatarUploadModal" })}
          onShareProfile={() => dispatch({ type: "shareProfileModal" })}
          onSubscription={() => dispatch({ type: "subscriptionModal" })}
        />

        {/* Tabs */}
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body">
                <div className="profile-tab">
                  <div className="custom-tab-1">
                    <Tab.Container
                      activeKey={activeTab}
                      onSelect={setActiveTab}
                    >
                      <Nav
                        as="ul"
                        className="nav nav-tabs justify-content-center justify-content-md-start"
                      >
                        <Nav.Item as="li" className="nav-item">
                          <Nav.Link to="#my-posts" eventKey="Posts">
                            Posts
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li" className="nav-item">
                          <Nav.Link to="#my-trophies" eventKey="Trophies">
                            My Trophies
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li" className="nav-item">
                          <Nav.Link to="#about-me" eventKey="About">
                            About Me
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item as="li" className="nav-item">
                          <Nav.Link to="#profile-settings" eventKey="Setting">
                            Settings
                          </Nav.Link>
                        </Nav.Item>
                      </Nav>
                      <Tab.Content>
                        {/* Posts */}
                        <Tab.Pane id="my-posts" eventKey="Posts">
                          <PostList
                            user={{ ...user, avatarUrl: avatarPreview || avatarUrl }}
                            onCameraClick={() => dispatch({ type: "cameraModal" })}
                            onPostModalClick={() => dispatch({ type: "postModal" })}
                          />
                          <CreatePostModal
                            show={state.post}
                            onHide={() => dispatch({ type: "postModal" })}
                            onPostCreated={handlePostCreated}
                            categories={categories}
                            user={{ ...user, avatarUrl: avatarPreview || avatarUrl }}
                          />
                        </Tab.Pane>

                        {/* Trophies */}
                        <Tab.Pane id="my-trophies" eventKey="Trophies">
                          <TrophyList
                            trophies={trophies}
                            trophyCategories={trophyCategories}
                            selectedTrophyCategory={selectedTrophyCategory}
                            setSelectedTrophyCategory={setSelectedTrophyCategory}
                            onInit={onInit}
                            onDelete={handleDeleteTrophy}
                          />
                        </Tab.Pane>

                        {/* About */}
                        <Tab.Pane id="about-me" eventKey="About">
                          <div className="profile-about-me">
                            <div className="pt-4 border-bottom-1 pb-3">
                              <h4 className="text-primary">About Me</h4>
                              <p className="mb-2">{user.info.about}</p>
                            </div>
                          </div>
                          <div className="profile-skills mb-5">
                            <h4 className="text-primary mb-2">Skills</h4>
                            {(user.info.skills || []).map((skill, index) => (
                              <Link
                                key={index}
                                to="#"
                                className="btn btn-primary light btn-xs mb-1 me-1"
                              >
                                {skill}
                              </Link>
                            ))}
                          </div>
                          <div className="profile-lang mb-5">
                            <h4 className="text-primary mb-2">Language</h4>
                            {(user.info.languages || []).map(
                              (language, index) => (
                                <Link
                                  key={index}
                                  className="text-muted pe-3 f-s-16"
                                >
                                  {language}
                                </Link>
                              )
                            )}
                          </div>
                          <div className="profile-personal-info">
                            <h4 className="text-primary mb-4">
                              Personal Information
                            </h4>
                            <div className="row mb-2">
                              <div className="col-3">
                                <h5 className="f-w-500">
                                  Name<span className="pull-right">:</span>
                                </h5>
                              </div>
                              <div className="col-9">
                                <span>{user.name}</span>
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-3">
                                <h5 className="f-w-500">
                                  Email<span className="pull-right">:</span>
                                </h5>
                              </div>
                              <div className="col-9">
                                <span>{user.email}</span>
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-3">
                                <h5 className="f-w-500">
                                  Age<span className="pull-right">:</span>
                                </h5>
                              </div>
                              <div className="col-9">
                                <span>{user.age}</span>
                              </div>
                            </div>
                            <div className="row mb-2">
                              <div className="col-3">
                                <h5 className="f-w-500">
                                  Location<span className="pull-right">:</span>
                                </h5>
                              </div>
                              <div className="col-9">
                                <span>
                                  {user.location.city}, {user.location.country}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Tab.Pane>

                        {/* Settings */}
                        <Tab.Pane id="profile-settings" eventKey="Setting">
                          <ProfileSettings
                            user={me || {}}
                            onUpdateProfile={handleUpdateProfile}
                            onPasswordChange={handlePasswordChange}
                          />
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <Modal
        className="modal fade"
        show={state.subscription}
        onHide={() => dispatch({ type: "subscriptionModal" })}
        centered
        size="lg"
      >
        <div
          className="modal-content"
          style={{ border: "none", borderRadius: "15px", overflow: "hidden" }}
        >
          <div
            className="modal-header text-white text-center"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              padding: "2rem 1.5rem 1rem",
            }}
          >
            <div className="w-100">
              <h3 className="modal-title mb-2" style={{ fontWeight: "600" }}>
                🚀 Unlock Premium Features
              </h3>
              <p
                className="mb-0"
                style={{ opacity: "0.9", fontSize: "1.1rem" }}
              >
                Upgrade to Premium and take your profile to the next level!
              </p>
            </div>
            <Button
              variant=""
              type="button"
              className="btn-close btn-close-white"
              onClick={() => dispatch({ type: "subscriptionModal" })}
              style={{ position: "absolute", top: "15px", right: "15px" }}
            ></Button>
          </div>
          <div className="modal-body p-0">
            <div
              className="text-center p-4"
              style={{
                backgroundColor: "#f8f9fa",
                borderTop: "1px solid #dee2e6",
              }}
            >
              <p className="text-muted mb-3">
                <i className="fa fa-lock me-2"></i>Secure payment • Cancel
                anytime • 30-day money-back guarantee
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubscriptionUpgrade}
                  disabled={upgrading}
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    padding: "0.75rem 2rem",
                    borderRadius: "25px",
                    fontWeight: "600",
                  }}
                >
                  {upgrading
                    ? "Upgrading…"
                    : "🚀 Upgrade to Premium - $10/year"}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => dispatch({ type: "subscriptionModal" })}
                  style={{ padding: "0.75rem 2rem", borderRadius: "25px" }}
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cover Photo Upload Modal */}
      <Modal
        className="modal fade"
        show={state.coverPhotoUpload}
        onHide={() => dispatch({ type: "coverPhotoUploadModal" })}
        centered
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Cover Photo</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => dispatch({ type: "coverPhotoUploadModal" })}
            ></Button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="coverPhotoInput" className="form-label">
                Choose Cover Photo
              </label>
              <input
                type="file"
                className="form-control"
                id="coverPhotoInput"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleCoverPhotoChange}
              />
            </div>
            {coverPhotoPreview && (
              <div className="mb-3">
                <label className="form-label">Preview:</label>
                <img
                  src={coverPhotoPreview || "/placeholder.svg"}
                  alt="Cover preview"
                  className="img-fluid rounded"
                  style={{
                    maxHeight: "200px",
                    width: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "coverPhotoUploadModal" })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCoverPhotoUpload}
              disabled={!coverPhoto}
            >
              Upload Cover Photo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        className="modal fade"
        show={state.avatarUpload}
        onHide={() => dispatch({ type: "avatarUploadModal" })}
        centered
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload Avatar</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => dispatch({ type: "avatarUploadModal" })}
            />
          </div>
          <div className="modal-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src={avatarPreview || avatarUrl || profile}
                alt="preview"
                className="rounded-circle"
                style={{ width: 96, height: 96, objectFit: "cover" }}
              />
              <div className="flex-grow-1">
                <label htmlFor="avatarInput" className="form-label">
                  Choose Image
                </label>
                <input
                  id="avatarInput"
                  type="file"
                  className="form-control"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleAvatarPick}
                />
                <small className="text-muted">PNG/JPEG • ~1–2MB</small>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "avatarUploadModal" })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAvatarUpload}
              disabled={!avatarFile}
            >
              Upload Avatar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Post Detail Modal */}
      <Modal
        className="modal fade"
        show={state.postDetail}
        onHide={() => dispatch({ type: "postDetailModal" })}
        centered
        size="lg"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{selectedPost?.title}</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => dispatch({ type: "postDetailModal" })}
            ></Button>
          </div>
          <div className="modal-body">
            {selectedPost && (
              <>
                <img
                  src={selectedPost.image || "/placeholder.svg"}
                  alt=""
                  className="img-fluid w-100 rounded mb-3"
                />
                <p>{selectedPost.content}</p>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Post Modal (existing upload flow) */}


      {/* Share Profile Modal */}
      <Modal
        className="modal fade"
        show={state.shareProfile}
        onHide={() => dispatch({ type: "shareProfileModal" })}
        centered
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share Profile</h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => dispatch({ type: "shareProfileModal" })}
            ></Button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Profile URL:</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={`${window.location.origin
                    }/profile/${me?.publicId || "profile"}`}
                  readOnly
                />
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    const url = `${window.location.origin
                      }/profile/${me?.publicId || "profile"}`;
                    navigator.clipboard.writeText(url);
                    alert("Profile URL copied to clipboard!");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="text-center">
              <p className="mb-3">Share on social media:</p>
              <div className="d-flex justify-content-center gap-2">
                <button className="btn btn-primary btn-sm">
                  <i className="fab fa-facebook-f"></i> Facebook
                </button>
                <button className="btn btn-info btn-sm">
                  <i className="fab fa-twitter"></i> Twitter
                </button>
                <button className="btn btn-primary btn-sm">
                  <i className="fab fa-linkedin"></i> LinkedIn
                </button>
                <button className="btn btn-success btn-sm">
                  <i className="fab fa-whatsapp"></i> WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Camera Modal (NEW: capture → preview → details → post) */}
      <CameraModal
        show={state.camera}
        onHide={() => dispatch({ type: "cameraModal" })}
        onPostCreated={refreshPosts}
        categories={categories}
      />


      {/* Reply Modal */}
      <Modal
        show={state.reply}
        className="modal fade"
        id="replyModal"
        onHide={() => dispatch({ type: "replyModal" })}
        centered
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Post Reply</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => dispatch({ type: "replyModal" })}
            ></button>
          </div>
          <div className="modal-body">
            <form>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Message"
              />
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-danger light"
              onClick={() => dispatch({ type: "replyModal" })}
            >
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Reply
            </button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
}

export default UserPage;
