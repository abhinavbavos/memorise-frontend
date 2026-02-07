
import React, { useState, useRef } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { myPosts, presignMyPost, createPost } from "../../data/api/posts";
import { getMyProfile } from "../../data/api/users";

const CreatePostModal = ({ show, onHide, onPostCreated, categories, user }) => {
    const [postForm, setPostForm] = useState({
        title: "",
        description: "",
        category: "",
        file: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState(null);

    const cameraInputRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handlePostFormChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
            const f = files?.[0];
            if (f) {
                setPostForm((p) => ({ ...p, file: f }));
                const r = new FileReader();
                r.onload = (ev) => setPreview(ev.target.result);
                r.readAsDataURL(f);
            }
            return;
        }
        setPostForm((p) => ({ ...p, [name]: value }));
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            if (!postForm.file) return alert("Please choose a file or take a photo");
            if (!postForm.category) return alert("Please select a category");

            // Check post limit for free users
            const { data: userData } = await getMyProfile();
            const isPremium = (userData?.plan || "").toLowerCase() === "premium";

            if (!isPremium) {
                // Count user's posts
                const { data: postsData } = await myPosts();
                const postCount = Array.isArray(postsData) ? postsData.length : postsData.items?.length || 0;

                if (postCount >= 10) {
                    alert("You've reached the limit of 10 posts for free users. Upgrade to Premium to post unlimited content!");
                    onHide();
                    return;
                }
            }

            setIsSubmitting(true);

            // 1) presign
            const presign = await presignMyPost(postForm.file.type, postForm.file.size);
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
            const { data: newPost } = await createPost({
                title: postForm.title || postForm.file.name,
                description: postForm.description || "",
                category: postForm.category,
                fileKey: presign.key,
                fileMime: postForm.file.type,
                fileSize: postForm.file.size,
            });

            // 4) reset + refresh
            setPostForm({ title: "", description: "", category: "", file: null });
            setPreview(null);
            onHide();
            if (onPostCreated) await onPostCreated(newPost);
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || e?.message || "Post failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const missingFields = [];
    if (!postForm.category) missingFields.push("Category");
    // Title not mandatory for sleek look if description exists? User logic said title/file mandatory before. 
    // Stick to previous validation for now but make UI cleaner.
    if (!postForm.title) missingFields.push("Title");
    if (!postForm.file) missingFields.push("Media");

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            contentClassName="border-0 shadow rounded-4"
            backdropClassName="bg-dark opacity-50"
        >
            <Modal.Header closeButton className="border-0 px-4 pt-4 pb-0">
                <Modal.Title className="fw-bold h5 mb-0 text-center w-100 ps-4">
                    Create New Post
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="d-flex mb-4">
                    <img
                        src={user?.avatarUrl || "/placeholder.svg"}
                        alt="User"
                        className="rounded-circle me-3"
                        style={{ width: 48, height: 48, objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1 text-dark">{user?.name || "User"}</h6>
                        <Form.Select
                            name="category"
                            value={postForm.category}
                            onChange={handlePostFormChange}
                            className="form-select form-select-sm border-0 bg-light rounded-pill w-auto px-3 py-1 shadow-none"
                            style={{ fontWeight: "600", color: "#666", cursor: "pointer" }}
                        >
                            <option value="">Select Category ▾</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Form.Select>
                    </div>
                </div>

                {/* Title & Description Area */}
                <div className="mb-4 p-3 rounded-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
                    <input
                        type="text"
                        name="title"
                        value={postForm.title}
                        onChange={handlePostFormChange}
                        placeholder="Give your post a title..."
                        className="form-control border-0 fs-5 fw-bold px-0 shadow-none mb-2"
                        style={{ backgroundColor: "transparent" }}
                    />
                    <textarea
                        rows={3}
                        name="description"
                        value={postForm.description}
                        onChange={handlePostFormChange}
                        placeholder="What have you achieved today?"
                        className="form-control border-0 fs-6 px-0 shadow-none resize-none"
                        style={{ backgroundColor: "transparent" }}
                    />
                </div>

                {/* Media Preview Area */}
                <div className="mb-4">
                    {preview ? (
                        <div className="position-relative rounded-4 overflow-hidden shadow-sm">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-100"
                                style={{ maxHeight: "400px", objectFit: "contain", backgroundColor: "#f8f9fa" }}
                            />
                            <button
                                type="button"
                                className="btn btn-dark btn-sm position-absolute top-0 end-0 m-3 rounded-circle shadow"
                                style={{ width: 32, height: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                                onClick={() => { setPostForm(p => ({ ...p, file: null })); setPreview(null); }}
                            >
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <div
                            className="border rounded-4 p-5 text-center cursor-pointer transition-all"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                borderStyle: "dashed",
                                borderColor: "#e0e0e0",
                                backgroundColor: "#fafafa"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f2f5"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fafafa"}
                        >
                            <div className="mb-3 p-3 d-inline-block rounded-circle bg-light text-primary">
                                <i className="fa fa-cloud-upload fs-3"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-1">Add Photos/Videos</h6>
                            <p className="text-muted small mb-0">or drag and drop</p>
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    onChange={handlePostFormChange}
                    accept="image/*,video/*,application/pdf"
                    className="d-none"
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handlePostFormChange}
                    name="file"
                />

                {/* Footer Actions */}
                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-light rounded-circle text-success d-flex align-items-center justify-content-center p-0"
                            style={{ width: 42, height: 42, transition: "0.2s" }}
                            onClick={() => fileInputRef.current?.click()}
                            title="Add Photo"
                        >
                            <i className="fa fa-image fs-5"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-light rounded-circle text-primary d-flex align-items-center justify-content-center p-0"
                            style={{ width: 42, height: 42, transition: "0.2s" }}
                            onClick={() => cameraInputRef.current?.click()}
                            title="Take Photo"
                        >
                            <i className="fa fa-camera fs-5"></i>
                        </button>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {missingFields.length > 0 && (
                            <span className="text-danger small fw-bold">
                                {missingFields.join(", ")} required
                            </span>
                        )}
                        <Button
                            variant="primary"
                            type="submit"
                            onClick={handleCreatePost}
                            disabled={isSubmitting || missingFields.length > 0}
                            className="rounded-pill px-4 fw-bold"
                            style={{ minWidth: "120px" }}
                        >
                            {isSubmitting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CreatePostModal;
