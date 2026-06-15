import React from 'react';
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import { IMAGES } from "../../data/constant/theme";
import { resolveImageUrl } from "../../utils/urlHelpers";
import { Ic } from "./profileIcons";

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

    const handleDownloadImage = async (imageUrl, title) => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("Failed to fetch image");
            const blob = await response.blob();

            // Determine MIME type from URL FIRST (priority), then from blob
            let mimeType = "image/png";
            let ext = "png";

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
                mimeType = blob.type;
                ext = blob.type.split("/")[1] || "png";
            }

            const typedBlob = new Blob([blob], { type: mimeType });
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${(title || "trophy").replace(/\s+/g, "-")}-${timestamp}.${ext}`;

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
        <div>
            {/* category filter */}
            {trophyCategories?.length > 1 && (
                <div className="pf-filterbar">
                    {trophyCategories.map((category, index) => (
                        <button
                            key={index}
                            className={`pf-fbtn ${selectedTrophyCategory === category ? "pf-fbtn--active" : ""}`}
                            onClick={() => setSelectedTrophyCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}

            {filteredTrophies?.length > 0 ? (
                <LightGallery
                    onInit={onInit}
                    speed={500}
                    plugins={[]}
                    selector=".gallery-item"
                    elementClassNames="pf-trophies"
                >
                    {filteredTrophies.map((item, index) => {
                        const img = resolveImageUrl(item.fileUrl || item.thumbUrl || item.imageUrl || item.image) || IMAGES.Profile3;
                        const trophyId = item._id || item.id || item._postId;
                        return (
                            <div key={item._id || index} className="pf-trophy">
                                <a
                                    href={img}
                                    data-src={img}
                                    className="gallery-item pf-trophy__media"
                                >
                                    {item.category && <span className="pf-trophy__cat pf-tagbadge">{item.category}</span>}
                                    <img src={img} alt={item.title || "Achievement"} />
                                </a>

                                <div className="pf-trophy__body">
                                    <h3 className="pf-trophy__title">{item.title || "Achievement"}</h3>
                                    {item.year && (
                                        <span className="pf-trophy__meta">{Ic.calendar}{item.year}</span>
                                    )}
                                    {item.description && (
                                        <p className="pf-trophy__desc">{item.description}</p>
                                    )}
                                </div>

                                <div className="pf-trophy__foot">
                                    <button
                                        className="ad-btn ad-btn--primary ad-btn--sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadImage(img, item.title);
                                        }}
                                        title="Download image"
                                    >
                                        {Ic.download} Download
                                    </button>
                                    {onDelete && (
                                        <button
                                            className="ad-btn ad-btn--ghost ad-btn--sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!trophyId) {
                                                    console.warn("Trophy has no ID:", item);
                                                    return;
                                                }
                                                onDelete(trophyId);
                                            }}
                                            title="Delete trophy"
                                            style={{ flex: "0 0 auto" }}
                                        >
                                            {Ic.trash}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </LightGallery>
            ) : (
                <div className="ad-state">
                    {Ic.trophy}
                    <p className="ad-state__title">No trophies yet</p>
                    <p className="ad-state__sub">Try a different category or upload a new achievement.</p>
                </div>
            )}
        </div>
    );
};

export default TrophyList;
