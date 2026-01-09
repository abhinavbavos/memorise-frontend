
import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import api from "../../data/api";

const CameraModal = ({ show, onHide, onPostCreated, categories }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraStreamRef = useRef(null);

    const [cameraError, setCameraError] = useState("");
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState(null);
    const [capturedPreview, setCapturedPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraPostForm, setCameraPostForm] = useState({
        title: "",
        description: "",
        category: "",
    });

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

    const startCamera = async () => {
        try {
            setCameraError("");
            // Don't clear blob here if we want to potentially keep it, 
            // but usually startCamera means we want to see the feed.
            // If we have a captured preview, we might hide the video via CSS, 
            // but the stream should be potentially active if we want instant retake.
            // For simplicity, let's keep the stream running until modal closes.

            if (cameraStreamRef.current) return; // already running

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
                // NOTE: We DO NOT stop camera here so we can "Retake" instantly
            },
            "image/jpeg",
            0.92
        );
    };

    const resetCapture = () => {
        setCapturedBlob(null);
        if (capturedPreview) URL.revokeObjectURL(capturedPreview);
        setCapturedPreview(null);
        // Video is still running in background, just hidden via CSS
    };

    useEffect(() => {
        if (show) {
            startCamera();
        } else {
            stopCamera();
            resetCapture();
            setCameraPostForm({ title: "", description: "", category: "" });
        }
        return () => {
            stopCamera(); // cleanup on unmount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const handleCameraPostFormChange = (e) => {
        const { name, value } = e.target;
        setCameraPostForm((p) => ({ ...p, [name]: value }));
    };

    const handleCreateCameraPost = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            if (!capturedBlob) return alert("Please capture a photo first");
            if (!cameraPostForm.category) return alert("Please select a category");

            setIsSubmitting(true);

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
            className="modal fade"
            id="cameraModal"
            onHide={onHide}
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
                        onClick={onHide}
                    ></button>
                </div>

                <div className="modal-body">
                    {/* Live camera view - ALWAYS mounted to keep stream active, toggle visibility */}
                    <div style={{ display: capturedPreview ? "none" : "block" }}>
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
                    </div>

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
                                        onClick={resetCapture}
                                        disabled={isSubmitting}
                                        className="me-2"
                                    >
                                        <i className="fa fa-undo me-1" />
                                        Retake
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        type="button"
                                        disabled={isSubmitting}
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
                                        disabled={isSubmitting}
                                        onClick={onHide}
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Posting..." : "Post"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </div>

                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
        </Modal>
    );
};

export default CameraModal;
