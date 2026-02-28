import React from "react";
import { Badge, Dropdown, Button } from "react-bootstrap";
import { SVGICON } from "../../data/constant/theme";
import profile from "../../assets/images/profile/profile.png";
import { resolveImageUrl } from "../../utils/urlHelpers";

const ProfileHeader = ({
    user,
    coverUrl,
    avatarUrl,
    onCoverUpload,
    onAvatarUpload,
    onShareProfile,
    onSubscription,
}) => {
    return (
        <div className="row">
            <div className="col-lg-12">
                <div className="profile card card-body px-3 pt-3 pb-0">
                    <div className="profile-head">
                        <div className="photo-content">
                            <div
                                className="cover-photo rounded position-relative"
                                style={{
                                    backgroundImage: coverUrl
                                        ? `url(${resolveImageUrl(coverUrl)})`
                                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    minHeight: "200px",
                                }}
                            >
                                {/* Change Cover Button */}
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        bottom: "15px",
                                        right: "15px",
                                        borderRadius: "25px",
                                        padding: "8px 18px",
                                        fontSize: "0.9rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        background: "rgba(0, 82, 204, 0.9)",
                                        border: "1px solid rgba(255,255,255,0.4)",
                                        backdropFilter: "blur(4px)",
                                        color: "white",
                                        transition: "all 0.3s ease",
                                        fontWeight: "600",
                                        position: "absolute",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                        cursor: "pointer",
                                    }}
                                    onClick={onCoverUpload}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "rgba(0, 82, 204, 1)";
                                        e.target.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "rgba(0, 82, 204, 0.9)";
                                        e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                                    }}
                                >
                                    <i className="fa fa-camera"></i> Change Cover
                                </button>
                            </div>
                        </div>
                        <div className="profile-info">
                            <div
                                className="profile-photo position-relative"
                            // ...
                            >
                                <img
                                    src={resolveImageUrl(avatarUrl) || profile}
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
                                    className="btn btn-primary position-absolute"
                                    style={{
                                        bottom: -5,
                                        right: -5,
                                        borderRadius: "50%",
                                        width: 45,
                                        height: 45,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "linear-gradient(135deg, #0052cc, #003d99)",
                                        boxShadow: "0 4px 12px rgba(0, 82, 204, 0.4)",
                                        border: "3px solid white",
                                        transition: "all 0.2s ease",
                                        cursor: "pointer",
                                        padding: "0",
                                    }}
                                    onClick={onAvatarUpload}
                                    title="Change avatar"
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = "scale(1.1)";
                                        e.target.style.boxShadow = "0 6px 16px rgba(0, 82, 204, 0.5)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = "scale(1)";
                                        e.target.style.boxShadow = "0 4px 12px rgba(0, 82, 204, 0.4)";
                                    }}
                                >
                                    <i
                                        className="fa fa-camera"
                                        style={{ fontSize: 18, color: "white" }}
                                    />
                                </button>
                            </div>
                            <div className="profile-details d-flex align-items-center flex-wrap gap-4 ps-4 pt-3 w-100">
                                <div className="d-flex align-items-center flex-wrap gap-3">
                                    <h4 className="text-primary mb-0 font-w600">{user?.name}</h4>
                                    <Badge
                                        as="span"
                                        bg="badge-rounded"
                                        className="badge-outline-dark"
                                        style={{
                                            padding: "0.4rem 0.8rem",
                                            display: `flex`,
                                            alignItems: `center`,
                                            borderRadius: `0.75em`,
                                            fontSize: "0.75rem",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {user?.plan}
                                    </Badge>
                                </div>
                                <Dropdown className="dropdown ms-auto d-flex align-items-center gap-2">
                                    <button className="sendbtn sharp shadow-sm" onClick={onShareProfile}>
                                        {SVGICON.Send}
                                    </button>
                                    {user?.plan !== "Premium" && (
                                        <Button
                                            size="sm"
                                            className="ms-2 px-3 rounded-pill fw-bold"
                                            onClick={onSubscription}
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
    );
};

export default ProfileHeader;
