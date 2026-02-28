import React from 'react';
import { Badge } from 'react-bootstrap';
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import { IMAGES } from "../../data/constant/theme";
import { resolveImageUrl } from "../../utils/urlHelpers";

const TrophyList = ({
    trophies,
    trophyCategories,
    selectedTrophyCategory,
    setSelectedTrophyCategory,
    onInit = () => { },
    onDelete,
}) => {

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

    const handleDownloadImage = async (imageUrl, title) => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("Failed to fetch image");
            const blob = await response.blob();

            // Determine MIME type from URL FIRST (priority), then from blob
            let mimeType = "image/png"; // default
            let ext = "png";

            // Check URL extension first (priority)
            if (imageUrl.includes(".jpg") || imageUrl.includes(".jpeg")) {
                mimeType = "image/jpeg";
                ext = "jpg";
            } else if (imageUrl.includes(".png")) {
                mimeType = "image/png";
                ext = "png";
            } else if (imageUrl.includes(".gif")) {
                mimeType = "image/gif";
                ext = "gif";
            } else if (imageUrl.includes(".webp")) {
                mimeType = "image/webp";
                ext = "webp";
            } else if (blob.type && blob.type !== "application/octet-stream") {
                // Use blob type only if URL didn't match and blob type is valid
                mimeType = blob.type;
                ext = blob.type.split("/")[1] || "png";
            }

            // Create blob with correct MIME type
            const typedBlob = new Blob([blob], { type: mimeType });

            // Create filename
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${(title || "trophy").replace(/\s+/g, "-")}-${timestamp}.${ext}`;

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

    return (
        <div className="col-lg-12">
            <div className="card mb-4 border-0 bg-transparent shadow-none">
                <div className="card-header border-0 pb-0 bg-transparent px-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100 mb-3">
                        <div className="d-flex flex-wrap gap-2">
                            {trophyCategories.map((category, index) => (
                                <Badge
                                    key={index}
                                    pill
                                    bg={
                                        selectedTrophyCategory === category
                                            ? getTrophyBadgeVariant(category)
                                            : "light"
                                    }
                                    className={`cursor-pointer px-3 py-2 ${selectedTrophyCategory === category
                                        ? ""
                                        : "text-dark border bg-white"
                                        }`}
                                    style={{ cursor: "pointer", fontSize: "0.85rem" }}
                                    onClick={() => setSelectedTrophyCategory(category)}
                                >
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card-body px-0 pt-0">
                    {filteredTrophies?.length > 0 ? (
                        <LightGallery
                            onInit={onInit}
                            speed={500}
                            plugins={[]}
                            selector=".gallery-item"
                            elementClassNames="d-flex flex-column gap-4"
                        >
                            {filteredTrophies.map((item, index) => (
                                <div key={item._id || index} className="card shadow-sm border-0">
                                    <div className="card-body p-3">
                                        {/* Post Header: Title + Category */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div className="d-flex align-items-center gap-2">
                                                <h6 className="mb-0 fw-bold text-dark fs-5">
                                                    {item.title || "Achievement"}
                                                </h6>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <Badge
                                                    bg={getTrophyBadgeVariant(item.category)}
                                                    className="px-2 py-1"
                                                >
                                                    {item.category}
                                                </Badge>
                                                {onDelete && (
                                                    <button
                                                        className="btn btn-sm btn-light text-danger border-0 rounded-circle p-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent lightbox
                                                            const trophyId = item._id || item.id || item._postId;
                                                            if (!trophyId) {
                                                                console.warn("Trophy has no ID:", item);
                                                                return;
                                                            }
                                                            onDelete(trophyId);
                                                        }}
                                                        title="Delete Trophy"
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Post Content: Description */}
                                        {(item.description || item.year) && (
                                            <p className="card-text text-secondary mb-3">
                                                {item.description || `Achieved in ${item.year}`}
                                            </p>
                                        )}

                                        {/* Post Image (Clickable for Lightbox) */}
                                        <div className="position-relative">
                                            <a
                                                href={resolveImageUrl(item.fileUrl || item.thumbUrl || item.imageUrl || item.image) || IMAGES.Profile3}
                                                data-src={resolveImageUrl(item.fileUrl || item.thumbUrl || item.imageUrl || item.image) || IMAGES.Profile3}
                                                className="gallery-item d-block rounded overflow-hidden bg-light cursor-pointer border"
                                                style={{ maxHeight: "500px", display: "flex", justifyContent: "center", alignItems: "center" }}
                                            >
                                                <img
                                                    src={resolveImageUrl(item.thumbUrl || item.fileUrl || item.imageUrl || item.image) || "/placeholder.svg"}
                                                    alt={item.title}
                                                    className="img-fluid"
                                                    style={{ objectFit: "contain", maxHeight: "500px", width: "100%" }}
                                                />
                                            </a>
                                            <button
                                                className="btn btn-sm btn-primary position-absolute"
                                                style={{
                                                    bottom: "10px",
                                                    right: "10px",
                                                    borderRadius: "50%",
                                                    width: "40px",
                                                    height: "40px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: "0"
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const imageUrl = resolveImageUrl(item.fileUrl || item.thumbUrl || item.imageUrl || item.image);
                                                    handleDownloadImage(imageUrl, item.title);
                                                }}
                                                title="Download image"
                                            >
                                                <i className="fa fa-download" style={{ fontSize: "16px" }}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </LightGallery>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <i className="fa fa-trophy text-muted" style={{ fontSize: "3rem" }}></i>
                            </div>
                            <h5 className="text-muted">No trophies found</h5>
                            <p className="text-muted small">
                                Try selecting a different category or upload a new achievement.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrophyList;
