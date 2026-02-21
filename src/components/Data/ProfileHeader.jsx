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
                                    className="btn btn-primary position-absolute"
                                    style={{
                                        bottom: "10px",
                                        right: "10px",
                                        borderRadius: "20px",
                                        padding: "5px 15px",
                                        fontSize: "0.85rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        background: "rgba(0,0,0,0.6)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        backdropFilter: "blur(4px)",
                                        color: "white",
                                        transition: "all 0.2s ease"
                                    }}
                                    onClick={onCoverUpload}
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
                                    onClick={onAvatarUpload}
                                    title="Change avatar"
                                >
                                    <i
                                        className="fa fa-camera"
                                        style={{ fontSize: 14, color: "white" }}
                                    />
                                </button>
                            </div>
                            <div className="profile-details d-flex align-items-center flex-wrap gap-4 ps-4 pt-3 w-100">
                                <div className="d-flex align-items-center flex-wrap gap-3">
                                    <h4 className="text-primary mb-0 font-w600">{user?.name}</h4>
                                    <span className="text-muted fs-14">{user?.email}</span>
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
