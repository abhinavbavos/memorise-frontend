
import { resolveImageUrl } from "../../utils/urlHelpers";

// ... existing imports

const TrophyList = ({
    trophies,
    // ...
}) => {
    // ...

    // Removed local resolveImageUrl definition

    return (
        // ...
        // Inside render loop:
        // Use resolveImageUrl(item.imageUrl || item.image) directly
        // ...
        <a
            href={resolveImageUrl(item.imageUrl || item.image) || IMAGES.Profile3}
            data-src={resolveImageUrl(item.imageUrl || item.image) || IMAGES.Profile3}
            className="gallery-item d-block rounded overflow-hidden bg-light cursor-pointer border"
            style={{ maxHeight: "500px", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <img
                src={resolveImageUrl(item.imageUrl || item.image) || "/placeholder.svg"}
                // ...
                alt={item.title}
                className="img-fluid"
                style={{ objectFit: "contain", maxHeight: "500px", width: "100%" }}
            />
        </a>
                                    </div >
                                </div >
                            ))}
                        </LightGallery >
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
                </div >
            </div >
        </div >
    );
};

export default TrophyList;
