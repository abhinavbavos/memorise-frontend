// src/pages/Public/PubUserPage.jsx
import { Fragment, useEffect, useReducer, useState } from "react";
import {
  Button,
  Dropdown,
  Modal,
  Tab,
  Nav,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import profile from "../../assets/images/profile/profile.png";
import { IMAGES, SVGICON } from "../../data/constant/theme";
import api from "../../data/api";

const initialState = {
  sendMessage: false,
  postDetail: false,
  reportPost: false,
  reportUser: false,
  shareProfile: false,
};

function reducer(state, action) {
  return {
    ...state,
    [action.type.replace("Modal", "")]:
      !state[action.type.replace("Modal", "")],
  };
}

function PostActionsDropdown({ post, onReport }) {
  return (
    <Dropdown>
      <Dropdown.Toggle as="div" variant="" className="i-false">
        <button className="btn btn-light btn-sm sharp" type="button">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <g fill="none">
                <circle fill="#000" cx="12" cy="5" r="2" />
                <circle fill="#000" cx="12" cy="12" r="2" />
                <circle fill="#000" cx="12" cy="19" r="2" />
              </g>
            </svg>
          </span>
        </button>
      </Dropdown.Toggle>
      <Dropdown.Menu className="dropdown-menu dropdown-menu-right border py-0">
        <div className="py-2">
          <button
            className="dropdown-item text-warning"
            onClick={() => onReport(post)}
          >
            <i className="fa fa-flag me-2"></i>Report Post
          </button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default function PubUserPage() {
  const { publicId } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [trophies, setTrophies] = useState([]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [reportedPost, setReportedPost] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  const [selectedTrophyCategory, setSelectedTrophyCategory] = useState("All");

  // Load public profile + posts + trophies
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // 1) public profile (includes avatarUrl/coverUrl & _id)
        const { data: pub } = await api.get(`/users/public/${publicId}`);
        if (cancelled) return;
        setUser(pub);

        // 2) posts for that user
        const uid = pub?._id || pub?.id;
        if (!uid) throw new Error("Invalid public profile response");

        const [{ data: postsRes }, { data: trophiesRes }] = await Promise.all([
          api.get(`/posts/user/${uid}`, { params: { page: 1, pageSize: 12 } }),
          api.get(`/trophies/user/${uid}`),
        ]);

        const items = Array.isArray(postsRes) ? postsRes : postsRes.items || [];
        const total = postsRes.total || items.length;
        const totalPages = postsRes.totalPages || 1;

        if (cancelled) return;
        setPosts({ items, total, page: 1, totalPages });
        setTrophies(Array.isArray(trophiesRes) ? trophiesRes : []);
      } catch (e) {
        console.error("Public profile load failed", e);
        if (!cancelled) {
          setPosts({ items: [], total: 0, page: 1, totalPages: 1 });
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

  const handlePostClick = (post) => {
    setSelectedPost(post);
    dispatch({ type: "postDetailModal" });
  };

  const handleReportPost = (post) => {
    setReportedPost(post);
    dispatch({ type: "reportPostModal" });
  };

  const submitReport = async () => {
    if (!user && !reportedPost) return;
    try {
      await api.post("/reports", {
        type: reportedPost ? "post" : "user",
        targetId: reportedPost
          ? reportedPost.id || reportedPost._id
          : user._id || user.id,
        reason: reportReason || "other",
        details: reportMessage || "",
      });
      // close modals + reset
      if (state.reportPost) dispatch({ type: "reportPostModal" });
      if (state.reportUser) dispatch({ type: "reportUserModal" });
      setReportReason("");
      setReportMessage("");
      setReportedPost(null);
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
                    ? `url(${user.coverUrl})`
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
                  src={user?.avatarUrl || profile}
                  className="img-fluid rounded-circle"
                  alt="profile"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
              </div>

              <div className="profile-details">
                <div className="profile-name px-3 pt-2">
                  <h4 className="text-primary mb-0">{user?.name || "User"}</h4>
                  <p className="mb-0">{user?.email || ""}</p>
                  <small className="text-muted">
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </small>
                </div>

                <Dropdown className="dropdown ms-auto flex justify-center gap-1">
                  <button
                    className="sendbtn sharp"
                    onClick={() => dispatch({ type: "shareProfileModal" })}
                    title="Share"
                  >
                    {SVGICON.Send}
                  </button>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mt-3">
          <div className="card-body">
            <Tab.Container defaultActiveKey="Posts">
              <Nav as="ul" className="nav nav-tabs">
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link eventKey="Posts">Posts</Nav.Link>
                </Nav.Item>
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link eventKey="Trophies">Trophies</Nav.Link>
                </Nav.Item>
                <Nav.Item as="li" className="nav-item">
                  <Nav.Link eventKey="About">About</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                {/* Posts */}
                <Tab.Pane eventKey="Posts">
                  <div className="my-post-content pt-3">
                    {posts.items.length > 0 ? (
                      posts.items.map((post) => (
                        <div
                          key={post._id || post.id}
                          className="profile-uoloaded-post border-bottom-1 pb-4 mb-4"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="text-black mb-1">{post.title}</h5>
                              <small className="text-muted">
                                {post.createdAt
                                  ? new Date(post.createdAt).toLocaleString()
                                  : ""}
                              </small>
                            </div>
                            <PostActionsDropdown
                              post={post}
                              onReport={handleReportPost}
                            />
                          </div>

                          <img
                            src={post.thumbUrl || IMAGES.Profile8}
                            alt=""
                            className="img-fluid w-100 rounded mb-3"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              handlePostClick({
                                ...post,
                                image: post.thumbUrl || IMAGES.Profile8,
                                content: post.description,
                              })
                            }
                          />

                          <p className="mb-3">{post.description}</p>
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
                      ))
                    ) : (
                      <div className="text-center py-5">
                        <i className="fa fa-image fa-3x text-muted mb-3"></i>
                        <p className="text-muted">No posts available</p>
                      </div>
                    )}
                  </div>
                </Tab.Pane>

                {/* Trophies */}
                <Tab.Pane eventKey="Trophies">
                  <div className="d-flex flex-wrap justify-center gap-2 mb-3">
                    {trophyCategories.map((c) => (
                      <Badge
                        key={c}
                        pill
                        bg={
                          selectedTrophyCategory === c
                            ? getTrophyBadgeVariant(c)
                            : "outline-secondary"
                        }
                        className={`cursor-pointer ${
                          selectedTrophyCategory === c ? "" : "text-dark border"
                        }`}
                        onClick={() => setSelectedTrophyCategory(c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>

                  {filteredTrophies.length > 0 ? (
                    <LightGallery speed={500} elementClassNames="row g-3">
                      {filteredTrophies.map((t, i) => (
                        <div
                          data-src={t.imageUrl || IMAGES.Profile3}
                          className="col-12 col-sm-6 col-lg-4 col-xl-4"
                          key={i}
                        >
                          <div className="trophy-item position-relative">
                            <img
                              className="img-fluid rounded"
                              src={t.imageUrl || IMAGES.Profile3}
                              alt={t.title}
                              style={{ width: "100%" }}
                            />
                            <div className="trophy-overlay position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2 rounded-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6
                                    className="mb-0 text-white"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    {t.title}
                                  </h6>
                                  <small className="text-light">
                                    {t.year || ""}
                                  </small>
                                </div>
                                <Badge
                                  bg={getTrophyBadgeVariant(t.category)}
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {t.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </LightGallery>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No trophies found.</p>
                    </div>
                  )}
                </Tab.Pane>

                {/* About */}
                <Tab.Pane eventKey="About">
                  <div className="pt-4">
                    <h5 className="text-primary">About {user?.name}</h5>
                    <p className="mb-2">{user?.about || "-"}</p>
                    <p className="text-muted mb-0">
                      <i className="fa fa-map-marker me-2"></i>
                      {user?.city}
                      {user?.country ? `, ${user.country}` : ""}
                    </p>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </div>
        </div>
      </div>

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
                <div className="mb-3">
                  <small className="text-muted">
                    {selectedPost.createdAt
                      ? new Date(selectedPost.createdAt).toLocaleString()
                      : ""}
                  </small>
                </div>
                <img
                  src={selectedPost.image || "/placeholder.svg"}
                  alt=""
                  className="img-fluid w-100 rounded mb-3"
                />
                <p>{selectedPost.content}</p>
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => {
                      dispatch({ type: "postDetailModal" });
                      handleReportPost(selectedPost);
                    }}
                  >
                    <i className="fa fa-flag me-1"></i>Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* Report Post/User Modal */}
      <Modal
        className="modal fade"
        show={state.reportPost || state.reportUser}
        onHide={() => {
          if (state.reportPost) dispatch({ type: "reportPostModal" });
          if (state.reportUser) dispatch({ type: "reportUserModal" });
        }}
        centered
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {reportedPost ? "Report Post" : "Report User"}
            </h5>
            <Button
              variant=""
              type="button"
              className="btn-close"
              onClick={() => {
                if (state.reportPost) dispatch({ type: "reportPostModal" });
                if (state.reportUser) dispatch({ type: "reportUserModal" });
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
                if (state.reportPost) dispatch({ type: "reportPostModal" });
                if (state.reportUser) dispatch({ type: "reportUserModal" });
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
                  className="btn btn-outline-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Profile URL copied!");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <a
                className="btn btn-primary btn-sm"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-facebook-f"></i> Facebook
              </a>
              <a
                className="btn btn-info btn-sm"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a
                className="btn btn-primary btn-sm"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
              <a
                className="btn btn-success btn-sm"
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
}
