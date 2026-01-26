
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
            await createPost({
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
            if (onPostCreated) await onPostCreated();
        } catch (e) {
            console.error(e);
            alert(e?.response?.data?.error || e?.message || "Post failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="lg"
            contentClassName="border-0 shadow-lg rounded-4"
        >
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-dark w-100 text-center">Create Post</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                    <img
                        src={user?.avatarUrl || "/placeholder.svg"}
                        alt="User"
                        className="rounded-circle me-3 border"
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                    />
                    <div>
                        <h6 className="fw-bold mb-0 text-dark">{user?.name || "User"}</h6>
                        <span className="badge bg-light text-secondary border rounded-pill">
                            <i className="fa fa-globe me-1"></i> Public
                        </span>
                    </div>
                </div>

                <Form onSubmit={handleCreatePost}>
                    <Form.Select
                        name="category"
                        value={postForm.category}
                        onChange={handlePostFormChange}
                        className="form-select-sm mb-3 rounded-pill bg-light border-0 px-3 py-2 w-auto"
                        style={{ fontWeight: "500" }}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </Form.Select>

                    <Form.Control
                        type="text"
                        name="title"
                        value={postForm.title}
                        onChange={handlePostFormChange}
                        placeholder="Title of your achievement (e.g. Best Coder 2024)"
                        className="border-0 fs-5 fw-bold mb-2 shadow-none px-0"
                    />

                    <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={postForm.description}
                        onChange={handlePostFormChange}
                        placeholder="What do you want to talk about?"
                        className="border-0 fs-6 shadow-none px-0 resize-none"
                    />

                    {/* Media Preview or Upload Box */}
                    <div className="mt-3">
                        {preview ? (
                            <div className="position-relative rounded overflow-hidden border">
                                <img src={preview} alt="Preview" className="w-100 h-auto" style={{ maxHeight: "300px", objectFit: "contain" }} />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-dark position-absolute top-0 end-0 m-2 rounded-circle"
                                    onClick={() => { setPostForm(p => ({ ...p, file: null })); setPreview(null); }}
                                >
                                    <i className="fa fa-times position-absolute top-50 start-50 translate-middle"></i>
                                </button>
                            </div>
                        ) : (
                            <div
                                className="border rounded-4 bg-light p-4 text-center cursor-pointer hover-bg-gray transition-all"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ borderStyle: "dashed !important" }}
                            >
                                <div className="mb-2">
                                    <i className="fa fa-image text-secondary fs-1"></i>
                                </div>
                                <h6 className="fw-bold text-dark">Add a photo or video</h6>
                                <p className="text-muted small mb-0">or drag and drop</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="file"
                            onChange={handlePostFormChange}
                            accept="image/*,video/*,application/pdf"
                            className="d-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                        <div className="d-flex gap-3">
                            <i className="fa fa-image fs-4 text-success cursor-pointer" onClick={() => fileInputRef.current?.click()}></i>
                            <i
                                className="fa fa-camera fs-4 text-primary cursor-pointer"
                                onClick={() => cameraInputRef.current?.click()}
                            ></i>
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

                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || (!postForm.title && !postForm.file)}
                            className="rounded-pill px-4 py-2 fw-bold"
                        >
                            {isSubmitting ? "Posting..." : "Post"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreatePostModal;
