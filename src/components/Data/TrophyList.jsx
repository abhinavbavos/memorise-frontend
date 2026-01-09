
import React from 'react';
import { Badge } from 'react-bootstrap';
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import { IMAGES } from "../../data/constant/theme";

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

    return (
        <div className="col-lg-12">
            <div className="card mb-4 border-0 bg-transparent shadow-none">
                <div className="card-header border-0 pb-0 bg-transparent px-0">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center w-100 mb-3">
                        <h5 className="text-primary mb-2 mb-md-0">My Trophies</h5>
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
                                                            onDelete(item._id);
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
                                        <a
                                            href={item.imageUrl || item.image || IMAGES.Profile3}
                                            data-src={item.imageUrl || item.image || IMAGES.Profile3}
                                            className="gallery-item d-block rounded overflow-hidden bg-light cursor-pointer border"
                                            style={{ maxHeight: "500px", display: "flex", justifyContent: "center", alignItems: "center" }}
                                        >
                                            <img
                                                src={item.imageUrl || item.image || "/placeholder.svg"}
                                                alt={item.title}
                                                className="img-fluid"
                                                style={{ objectFit: "contain", maxHeight: "500px", width: "100%" }}
                                            />
                                        </a>
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
