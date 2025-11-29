// src/pages/UserPage/UserPage.jsx
import { Fragment, useReducer, useState, useEffect, useRef } from "react";
import api from "../../data/api";
import {
  Button,
  Dropdown,
  Modal,
  Tab,
  Nav,
  Badge,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import profile from "../../assets/images/profile/profile.png";
import { IMAGES, SVGICON } from "../../data/constant/theme";

const initialState = {
  sendMessage: false,
  post: false,
  shareProfile: false,
  camera: false,
  reply: false,
  postDetail: false,
  coverPhotoUpload: false,
  avatarUpload: false, // NEW
  subscription: false, // note: toggled by "subscriptionModal"
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
    case "avatarUploadModal": // NEW
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

  // Pass activeTab and setActiveTab to Tab.Container for controlled tabs
  // This makes the tabs controlled by activeTab state
  const cameraInputRef = useRef(null);

  // ======= Camera capture: refs & state (NEW) =======
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraPostForm, setCameraPostForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  // Cover
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [selectedTrophyCategory, setSelectedTrophyCategory] =
    useState("All");

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

  // Local form state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    email: "",
    age: "",
    city: "",
    country: "",
    about: "",
    skills: [],
    languages: [],
  });
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  // Post modal form (existing upload flow)
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    category: "",
    file: null,
  });

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


  // ======= Camera helpers (NEW) =======
  const startCamera = async () => {
    try {
      setCameraError("");
      setCapturedBlob(null);
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
      setCapturedPreview(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (e) {
      setCameraError(e?.message || "Unable to access camera");
      setCameraReady(false);
    }
  };

  const stopCamera = () => {
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } catch {
      // Ignore errors when stopping camera
    }
    setCameraReady(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth || 1080;
    const h = video.videoHeight || 1440;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCapturedPreview(url);
      },
      "image/jpeg",
      0.92
    );
  };

  const resetCapture = () => {
    setCapturedBlob(null);
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedPreview(null);
  };

  useEffect(() => {
    if (state.camera) {
      startCamera();
    } else {
      stopCamera();
      resetCapture();
      setCameraPostForm({ title: "", description: "", category: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.camera]);

  const handleCameraPostFormChange = (e) => {
    const { name, value } = e.target;
    setCameraPostForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreateCameraPost = async (e) => {
    e.preventDefault();
    try {
      if (!capturedBlob) return alert("Please capture a photo first");
      if (!cameraPostForm.category) return alert("Please select a category");

      const file = new File([capturedBlob], "camera_capture.jpg", {
        type: "image/jpeg",
      });

      // 1) presign
      const { data: presign } = await api.get("/posts/me/presign", {
        params: { contentType: file.type, size: file.size },
      });
      if (!presign?.url || !presign?.key)
        throw new Error("Failed to get upload URL");

      // 2) PUT to S3
      const headers = s3PutHeaders(file.type, presign.requiredHeaders);

      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers,
        body: file,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => "");
        throw new Error(
          `S3 PUT failed: ${putRes.status} ${putRes.statusText}\n${errText}`
        );
      }

      // 3) finalize
      await api.post("/posts", {
        title: cameraPostForm.title || "Camera Capture",
        description: cameraPostForm.description || "",
        category: cameraPostForm.category,
        fileKey: presign.key,
        fileMime: file.type,
        fileSize: file.size,
      });

      // 4) cleanup + refresh
      dispatch({ type: "cameraModal" });
      await refreshPosts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || e?.message || "Post failed");
    }
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
        setProfileFormData((prev) => ({
          ...prev,
          name: meData.name || "",
          email: meData.email || "",
          age: meData.age || "",
          city: meData.city || "",
          country: meData.country || "",
          about: meData.about || "",
          skills: meData.skills || [],
          languages: meData.languages || [],
        }));

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
    if (me?.plan !== "premium") {
      dispatch({ type: "subscriptionModal" });
    } else {
      dispatch({ type: "coverPhotoUploadModal" });
    }
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

  // Profile form
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/me", {
        name: profileFormData.name,
        email: profileFormData.email,
        about: profileFormData.about,
        age: profileFormData.age ? Number(profileFormData.age) : undefined,
        city: profileFormData.city,
        country: profileFormData.country,
        skills: profileFormData.skills,
        languages: profileFormData.languages,
      });
      setMe(data);
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Update failed");
    }
  };

  const handleAddSkill = () => {
    const v = newSkill.trim();
    if (v && !profileFormData.skills.includes(v)) {
      setProfileFormData((prev) => ({ ...prev, skills: [...prev.skills, v] }));
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (s) =>
    setProfileFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((x) => x !== s),
    }));
  const handleAddLanguage = () => {
    const v = newLanguage.trim();
    if (v && !profileFormData.languages.includes(v)) {
      setProfileFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, v],
      }));
      setNewLanguage("");
    }
  };
  const handleRemoveLanguage = (l) =>
    setProfileFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((x) => x !== l),
    }));

  // Password
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handlePasswordFormSubmit = async (e) => {
    e.preventDefault();
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      return alert("New password and confirmation do not match");
    }
    try {
      await api.post("/auth/change-password", {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
      });
      setShowPasswordForm(false);
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password changed");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Change password failed");
    }
  };

  // Post modal helpers (existing upload flow)
  const handlePostFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file")
      return setPostForm((p) => ({ ...p, file: files?.[0] || null }));
    setPostForm((p) => ({ ...p, [name]: value }));
  };

  // Create Post (existing upload flow)
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      if (!postForm.file) return alert("Please choose a file");
      if (!postForm.category) return alert("Please select a category");

      // 1) presign
      const { data: presign } = await api.get("/posts/me/presign", {
        params: { contentType: postForm.file.type, size: postForm.file.size },
      });
      if (!presign?.url || !presign?.key)
        throw new Error("Failed to get upload URL");

      // 2) PUT to S3
      const headers = s3PutHeaders(postForm.file.type, presign.requiredHeaders);

      const putRes = await fetch(presign.url, {
        method: "PUT",
        headers,
        body: postForm.file,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => "");
        throw new Error(
          `S3 PUT failed: ${putRes.status} ${putRes.statusText}\n${errText}`
        );
      }

      // 3) finalize create
      await api.post("/posts", {
        title: postForm.title || postForm.file.name,
        description: postForm.description || "",
        category: postForm.category,
        fileKey: presign.key,
        fileMime: postForm.file.type,
        fileSize: postForm.file.size,
      });

      // 4) reset + refresh
      setPostForm({ title: "", description: "", category: "", file: null });
      dispatch({ type: "postModal" });
      await refreshPosts();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || e?.message || "Post failed");
    }
  };

  // Derived UI model
  const user = {
    name: me?.name || profileFormData.name || "Your Name",
    desig: "Freelancer",
    age: me?.age ?? profileFormData.age ?? "",
    email: me?.email || profileFormData.email || "",
    location: {
      city: me?.city || profileFormData.city || "",
      country: me?.country || profileFormData.country || "",
    },
    plan: me?.plan === "premium" ? "Premium" : "Basic Plan",
    info: {
      about: me?.about || profileFormData.about || "",
      skills: me?.skills?.length ? me.skills : profileFormData.skills,
      languages: me?.languages?.length
        ? me.languages
        : profileFormData.languages,
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
        <div className="row">
          <div className="col-lg-12">
            <div className="profile card card-body px-3 pt-3 pb-0">
              <div className="profile-head">
                <div className="photo-content">
                  <div
                    className="cover-photo rounded position-relative"
                    style={{
                      backgroundImage: coverPhotoPreview
                        ? `url(${coverPhotoPreview})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      minHeight: "200px",
                    }}
                  >
                    <button
                      className="btn btn-primary btn-sm position-absolute"
                      style={{
                        bottom: "10px",
                        right: "10px",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      onClick={handleCoverPhotoUploadClick}
                      title="Edit Cover Photo"
                    >
                      <i
                        className="fa fa-camera"
                        style={{ fontSize: "14px" }}
                      />
                    </button>
                  </div>
                </div>

                <div className="profile-info">
                  <div
                    className="profile-photo position-relative"
                    style={{
                      width: 200,
                      height: 110,
                      borderRadius: "50%",
                      padding: 4,
                      background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={avatarPreview || avatarUrl || profile}
                      className="img-fluid rounded-circle"
                      alt="profile"
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        border: "3px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <button
                      className="btn btn-primary btn-sm position-absolute"
                      style={{
                        bottom: 4,
                        right: 4,
                        borderRadius: "90%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #1976D2, #0D47A1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        border: "none",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onClick={() => dispatch({ type: "avatarUploadModal" })}
                      title="Change avatar"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.3)";
                      }}
                    >
                      <i
                        className="fa fa-camera"
                        style={{ fontSize: 14, color: "white" }}
                      />
                    </button>
                  </div>

                  <div className="profile-details">
                    <div className="profile-name px-3 pt-2">
                      <h4 className="text-primary mb-0">{user.name}</h4>
                      <p>{user.desig}</p>
                    </div>
                    <div className="profile-email px-2 pt-2">
                      <h4 className="text-muted mb-0">{user.email}</h4>
                      <p>Email</p>
                    </div>
                    <div className="bootstrap-badge" style={{ height: `35px` }}>
                      <Badge
                        as="span"
                        bg="badge-rounded"
                        className="badge-outline-dark"
                        style={{
                          height: `35px`,
                          display: `flex`,
                          alignItems: `center`,
                          borderRadius: `0.75em`,
                        }}
                      >
                        {user.plan}
                      </Badge>
                    </div>
                    <Dropdown className="dropdown ms-auto flex justify-center gap-1">
                      <button
                        className="sendbtn sharp"
                        onClick={() => dispatch({ type: "shareProfileModal" })}
                      >
                        {SVGICON.Send}
                      </button>
                      {me?.plan !== "premium" && (
                        <Button
                          size="sm"
                          className="ms-2"
                          onClick={() =>
                            dispatch({ type: "subscriptionModal" })
                          }
                        >
                          Upgrade
                        </Button>
                      )}
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                          <div className="my-post-content pt-3">
                            <div className="post-input">
                              <textarea
                                name="textarea"
                                id="textarea"
                                cols={30}
                                rows={3}
                                className="form-control bg-transparent"
                                placeholder="Write something… (optional)"
                                defaultValue={""}
                              />
                              <Link
                                to="#"
                                className="btn btn-primary light px-3 me-1"
                                onClick={() =>
                                  dispatch({ type: "cameraModal" })
                                }
                              >
                                <i className="fa fa-camera m-0" />
                              </Link>
                              <Link
                                to="#"
                                className="btn btn-primary ms-1"
                                onClick={() => dispatch({ type: "postModal" })}
                              >
                                Post
                              </Link>
                            </div>

                            {myPosts?.length > 0 ? (
                              myPosts.map((post, index) => (
                                <div
                                  key={post._id || post.id || index}
                                  className="profile-uoloaded-post border-bottom-1 pb-5"
                                  style={{ cursor: "pointer" }}
                                >
                                  <img
                                    src={post.thumbUrl || IMAGES.Profile8}
                                    alt=""
                                    className="img-fluid w-100 rounded"
                                    onClick={() =>
                                      handlePostClick({
                                        title: post.title,
                                        image: post.thumbUrl,
                                        content: post.description,
                                        category: post.category,
                                      })
                                    }
                                  />
                                  <div
                                    onClick={() =>
                                      handlePostClick({
                                        title: post.title,
                                        image: post.thumbUrl,
                                        content: post.description,
                                        category: post.category,
                                      })
                                    }
                                    className="d-flex justify-between align-items-center"
                                  >
                                    <h3 className="text-black post-title">
                                      {post.title}
                                    </h3>
                                    <Badge
                                      pill
                                      bg={
                                        post.category === "Sports"
                                          ? "danger"
                                          : post.category === "Internship"
                                            ? "warning"
                                            : "primary"
                                      }
                                    >
                                      {post.category}
                                    </Badge>
                                  </div>
                                  <p>{post.description}</p>
                                </div>
                              ))
                            ) : (
                              <p>No posts</p>
                            )}
                          </div>
                        </Tab.Pane>

                        {/* Trophies */}
                        <Tab.Pane id="my-trophies" eventKey="Trophies">
                          <div className="col-lg-12">
                            <div className="card">
                              <div className="card-header border-0 pb-0">
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100 px-2">
                                  <h5 className="text-primary">Trophies</h5>
                                  <div className="d-flex flex-wrap justify-center gap-2">
                                    {trophyCategories.map((category, index) => (
                                      <Badge
                                        key={index}
                                        pill
                                        bg={
                                          selectedTrophyCategory === category
                                            ? getTrophyBadgeVariant(category)
                                            : "outline-secondary"
                                        }
                                        className={`cursor-pointer ${selectedTrophyCategory === category
                                          ? ""
                                          : "text-dark border"
                                          }`}
                                        style={{
                                          cursor: "pointer",
                                          padding: "0.5rem 1rem",
                                          fontSize: "0.875rem",
                                          fontWeight:
                                            selectedTrophyCategory === category
                                              ? "600"
                                              : "400",
                                        }}
                                        onClick={() =>
                                          setSelectedTrophyCategory(category)
                                        }
                                      >
                                        {category}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="card-body pt-3">
                                {filteredTrophies?.length > 0 ? (
                                  <div className="profile-interest">
                                    <LightGallery
                                      onInit={onInit}
                                      speed={500}
                                      elementClassNames="row g-3"
                                    >
                                      {filteredTrophies.map((item, index) => (
                                        <div
                                          data-src={
                                            item.imageUrl ||
                                            item.image ||
                                            IMAGES.Profile3
                                          }
                                          className="col-12 col-sm-6 col-lg-4 col-xl-4"
                                          key={index}
                                        >
                                          <div className="trophy-item position-relative">
                                            <img
                                              className="img-fluid rounded"
                                              src={
                                                item.imageUrl ||
                                                item.image ||
                                                "/placeholder.svg"
                                              }
                                              style={{ width: "100%" }}
                                              alt={item.title}
                                            />
                                            <div className="trophy-overlay position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2 rounded-bottom">
                                              <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                  <h6
                                                    className="mb-0 text-white"
                                                    style={{
                                                      fontSize: "0.8rem",
                                                    }}
                                                  >
                                                    {item.title}
                                                  </h6>
                                                  <small className="text-light">
                                                    {item.year}
                                                  </small>
                                                </div>
                                                <Badge
                                                  bg={getTrophyBadgeVariant(
                                                    item.category
                                                  )}
                                                  style={{ fontSize: "0.7rem" }}
                                                >
                                                  {item.category}
                                                </Badge>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </LightGallery>
                                  </div>
                                ) : (
                                  <div className="text-center py-4">
                                    <p className="text-muted">
                                      No trophies found in the "
                                      {selectedTrophyCategory}" category.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
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
                          <div className="pt-3">
                            <Row>
                              <Col lg={12}>
                                <Card className="mb-4">
                                  <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="text-primary mb-0">
                                      Profile Information
                                    </h5>
                                    <Button
                                      variant={
                                        editingProfile ? "secondary" : "primary"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        setEditingProfile(!editingProfile)
                                      }
                                    >
                                      <i
                                        className={`fa ${editingProfile ? "fa-times" : "fa-edit"
                                          } me-1`}
                                      ></i>
                                      {editingProfile
                                        ? "Cancel"
                                        : "Edit Profile"}
                                    </Button>
                                  </Card.Header>
                                  <Card.Body>
                                    <Form onSubmit={handleProfileFormSubmit}>
                                      <Row>
                                        <Col md={6}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control
                                              type="text"
                                              name="name"
                                              value={profileFormData.name}
                                              onChange={handleProfileFormChange}
                                              disabled={!editingProfile}
                                              placeholder="Enter your full name"
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                              type="email"
                                              name="email"
                                              value={profileFormData.email}
                                              onChange={handleProfileFormChange}
                                              disabled={!editingProfile}
                                              placeholder="Enter your email"
                                            />
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      <Row>
                                        <Col md={4}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Age</Form.Label>
                                            <Form.Control
                                              type="number"
                                              name="age"
                                              value={profileFormData.age}
                                              onChange={handleProfileFormChange}
                                              disabled={!editingProfile}
                                              placeholder="Enter your age"
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                              type="text"
                                              name="city"
                                              value={profileFormData.city}
                                              onChange={handleProfileFormChange}
                                              disabled={!editingProfile}
                                              placeholder="Enter your city"
                                            />
                                          </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                          <Form.Group className="mb-3">
                                            <Form.Label>Country</Form.Label>
                                            <Form.Control
                                              type="text"
                                              name="country"
                                              value={profileFormData.country}
                                              onChange={handleProfileFormChange}
                                              disabled={!editingProfile}
                                              placeholder="Enter your country"
                                            />
                                          </Form.Group>
                                        </Col>
                                      </Row>

                                      <Form.Group className="mb-3">
                                        <Form.Label>About Me</Form.Label>
                                        <Form.Control
                                          as="textarea"
                                          rows={4}
                                          name="about"
                                          value={profileFormData.about}
                                          onChange={handleProfileFormChange}
                                          disabled={!editingProfile}
                                          placeholder="Tell us about yourself..."
                                        />
                                      </Form.Group>

                                      {/* Skills */}
                                      <Form.Group className="mb-3">
                                        <Form.Label>Skills</Form.Label>
                                        <div className="mb-2">
                                          {(profileFormData.skills || []).map(
                                            (skill, index) => (
                                              <Badge
                                                key={index}
                                                bg="primary"
                                                className="me-2 mb-2 d-inline-flex align-items-center"
                                                style={{
                                                  fontSize: "0.875rem",
                                                  padding: "0.5rem 0.75rem",
                                                }}
                                              >
                                                {skill}
                                                {editingProfile && (
                                                  <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="p-0 ms-2 text-white"
                                                    onClick={() =>
                                                      handleRemoveSkill(skill)
                                                    }
                                                    style={{
                                                      fontSize: "0.75rem",
                                                    }}
                                                  >
                                                    <i className="fa fa-times"></i>
                                                  </Button>
                                                )}
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                        {editingProfile && (
                                          <div className="d-flex">
                                            <Form.Control
                                              type="text"
                                              value={newSkill}
                                              onChange={(e) =>
                                                setNewSkill(e.target.value)
                                              }
                                              placeholder="Add a new skill"
                                              className="me-2"
                                              onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(),
                                                  handleAddSkill())
                                              }
                                            />
                                            <Button
                                              variant="outline-primary"
                                              onClick={handleAddSkill}
                                            >
                                              <i className="fa fa-plus"></i>
                                            </Button>
                                          </div>
                                        )}
                                      </Form.Group>

                                      {/* Languages */}
                                      <Form.Group className="mb-3">
                                        <Form.Label>Languages</Form.Label>
                                        <div className="mb-2">
                                          {(
                                            profileFormData.languages || []
                                          ).map((language, index) => (
                                            <Badge
                                              key={index}
                                              bg="success"
                                              className="me-2 mb-2 d-inline-flex align-items-center"
                                              style={{
                                                fontSize: "0.875rem",
                                                padding: "0.5rem 0.75rem",
                                              }}
                                            >
                                              {language}
                                              {editingProfile && (
                                                <Button
                                                  variant="link"
                                                  size="sm"
                                                  className="p-0 ms-2 text-white"
                                                  onClick={() =>
                                                    handleRemoveLanguage(
                                                      language
                                                    )
                                                  }
                                                  style={{
                                                    fontSize: "0.75rem",
                                                  }}
                                                >
                                                  <i className="fa fa-times"></i>
                                                </Button>
                                              )}
                                            </Badge>
                                          ))}
                                        </div>
                                        {editingProfile && (
                                          <div className="d-flex">
                                            <Form.Control
                                              type="text"
                                              value={newLanguage}
                                              onChange={(e) =>
                                                setNewLanguage(e.target.value)
                                              }
                                              placeholder="Add a new language"
                                              className="me-2"
                                              onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(),
                                                  handleAddLanguage())
                                              }
                                            />
                                            <Button
                                              variant="outline-success"
                                              onClick={handleAddLanguage}
                                            >
                                              <i className="fa fa-plus"></i>
                                            </Button>
                                          </div>
                                        )}
                                      </Form.Group>

                                      {editingProfile && (
                                        <div className="d-flex justify-content-end">
                                          <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() =>
                                              setEditingProfile(false)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="primary"
                                            type="submit"
                                          >
                                            <i className="fa fa-save me-1"></i>
                                            Save Changes
                                          </Button>
                                        </div>
                                      )}
                                    </Form>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>

                            {/* Security */}
                            <Row>
                              <Col lg={12}>
                                <Card>
                                  <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="text-primary mb-0">
                                      Security Settings
                                    </h5>
                                    <Button
                                      variant={
                                        showPasswordForm
                                          ? "secondary"
                                          : "warning"
                                      }
                                      size="sm"
                                      onClick={() =>
                                        setShowPasswordForm(!showPasswordForm)
                                      }
                                    >
                                      <i
                                        className={`fa ${showPasswordForm ? "fa-times" : "fa-key"
                                          } me-1`}
                                      ></i>
                                      {showPasswordForm
                                        ? "Cancel"
                                        : "Change Password"}
                                    </Button>
                                  </Card.Header>
                                  {showPasswordForm && (
                                    <Card.Body>
                                      <Form onSubmit={handlePasswordFormSubmit}>
                                        <Row>
                                          <Col md={12}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                Current Password
                                              </Form.Label>
                                              <Form.Control
                                                type="password"
                                                name="currentPassword"
                                                value={
                                                  passwordFormData.currentPassword
                                                }
                                                onChange={
                                                  handlePasswordFormChange
                                                }
                                                placeholder="Enter your current password"
                                                required
                                              />
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                        <Row>
                                          <Col md={6}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                New Password
                                              </Form.Label>
                                              <Form.Control
                                                type="password"
                                                name="newPassword"
                                                value={
                                                  passwordFormData.newPassword
                                                }
                                                onChange={
                                                  handlePasswordFormChange
                                                }
                                                placeholder="Enter new password"
                                                required
                                                minLength={6}
                                              />
                                              <Form.Text className="text-muted">
                                                Password must be at least 6
                                                characters long.
                                              </Form.Text>
                                            </Form.Group>
                                          </Col>
                                          <Col md={6}>
                                            <Form.Group className="mb-3">
                                              <Form.Label>
                                                Confirm New Password
                                              </Form.Label>
                                              <Form.Control
                                                type="password"
                                                name="confirmPassword"
                                                value={
                                                  passwordFormData.confirmPassword
                                                }
                                                onChange={
                                                  handlePasswordFormChange
                                                }
                                                placeholder="Confirm new password"
                                                required
                                                minLength={6}
                                              />
                                            </Form.Group>
                                          </Col>
                                        </Row>
                                        <div className="d-flex justify-content-end">
                                          <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() =>
                                              setShowPasswordForm(false)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="warning"
                                            type="submit"
                                          >
                                            <i className="fa fa-key me-1"></i>
                                            Change Password
                                          </Button>
                                        </div>
                                      </Form>
                                    </Card.Body>
                                  )}
                                </Card>
                              </Col>
                            </Row>
                          </div>
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
      <Modal
        show={state.post}
        className="modal fade"
        id="postModal"
        onHide={() => dispatch({ type: "postModal" })}
        centered
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create Post</h5>
            <Button
              variant=""
              type="button"
              className="close"
              onClick={() => dispatch({ type: "postModal" })}
            >
              <span>×</span>
            </Button>
          </div>
          <div className="modal-body">
            <Form onSubmit={handleCreatePost}>
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  value={postForm.title}
                  onChange={handlePostFormChange}
                  placeholder="e.g., Internship Offer Letter"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={postForm.description}
                  onChange={handlePostFormChange}
                  placeholder="Describe this certificate/achievement…"
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={postForm.category}
                  onChange={handlePostFormChange}
                  required
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>File</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  onChange={handlePostFormChange}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  required
                />
                <Form.Text muted>PNG/JPG or PDF</Form.Text>
                <div className="mt-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => cameraInputRef.current?.click()}
                    type="button"
                  >
                    <i className="fa fa-camera me-1"></i>
                    Take Photo
                  </Button>
                  {/* Hidden camera input */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handlePostFormChange}
                    name="file"
                  />
                </div>
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => dispatch({ type: "postModal" })}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Post
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal>

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
      <Modal
        show={state.camera}
        className="modal fade"
        id="cameraModal"
        onHide={() => dispatch({ type: "cameraModal" })}
        centered
        size="lg"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {capturedPreview ? "Preview & Details" : "Take a Photo"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => dispatch({ type: "cameraModal" })}
            ></button>
          </div>

          <div className="modal-body">
            {/* Live camera view (if not captured yet) */}
            {!capturedPreview && (
              <>
                {cameraError && (
                  <div className="alert alert-danger mb-3">{cameraError}</div>
                )}
                <div className="ratio ratio-4x3 bg-dark rounded overflow-hidden mb-3">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    onClick={takeSnapshot}
                    disabled={!cameraReady}
                    className="px-4"
                  >
                    <i className="fa fa-camera me-2" /> Capture
                  </Button>
                </div>
              </>
            )}

            {/* Preview + Details form */}
            {capturedPreview && (
              <Form onSubmit={handleCreateCameraPost}>
                <div className="mb-3">
                  <img
                    src={capturedPreview}
                    alt="Captured"
                    className="img-fluid rounded w-100"
                    style={{
                      maxHeight: 420,
                      objectFit: "contain",
                      background: "#000",
                    }}
                  />
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        name="title"
                        value={cameraPostForm.title}
                        onChange={handleCameraPostFormChange}
                        placeholder="e.g., Internship Offer Letter"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={cameraPostForm.category}
                        onChange={handleCameraPostFormChange}
                        required
                      >
                        <option value="">Select a category…</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mt-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={cameraPostForm.description}
                    onChange={handleCameraPostFormChange}
                    placeholder="Describe this certificate/achievement…"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <div>
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => {
                        resetCapture();
                      }}
                      className="me-2"
                    >
                      <i className="fa fa-undo me-1" />
                      Retake
                    </Button>
                    <Button
                      variant="outline-danger"
                      type="button"
                      onClick={() => {
                        resetCapture();
                        stopCamera();
                        startCamera();
                      }}
                    >
                      <i className="fa fa-refresh me-1" />
                      Reset Camera
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="secondary"
                      className="me-2"
                      type="button"
                      onClick={() => dispatch({ type: "cameraModal" })}
                    >
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Post
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </div>

          {/* hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </Modal>


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
