import React from "react";
import { Badge, Dropdown, Button } from "react-bootstrap";
import { SVGICON } from "../../data/constant/theme";
import profile from "../../assets/images/profile/profile.png";

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
                                        ? `url(${coverUrl})`
                                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    minHeight: "200px",
                                }}
                            >
                                <button
                                    className="btn btn-primary btn-sm position-absolute"
                                    style={{
                                        bottom: "10px",
                                        right: "10px",
                                        borderRadius: "50%",
                                        width: "40px",
                                        height: "40px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                    }}
                                    onClick={onCoverUpload}
                                    title="Edit Cover Photo"
                                >
                                    <i className="fa fa-camera" style={{ fontSize: "14px" }} />
                                </button>
                            </div>
                        </div>
                        <div className="profile-info">
                            <div
                                className="profile-photo position-relative"
                                style={{
                                    width: 200,
                                    height: 110,
                                    borderRadius: "50%",
                                    padding: 4,
                                    background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img
                                    src={avatarUrl || profile}
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
                            <div className="profile-details">
                                <div className="profile-name px-3 pt-2">
                                    <h4 className="text-primary mb-0">{user?.name}</h4>
                                    <p>{user?.desig}</p>
                                </div>
                                <div className="profile-email px-2 pt-2">
                                    <h4 className="text-muted mb-0">{user?.email}</h4>
                                    <p>Email</p>
                                </div>
                                <div className="bootstrap-badge" style={{ height: `35px` }}>
                                    <Badge
                                        as="span"
                                        bg="badge-rounded"
                                        className="badge-outline-dark"
                                        style={{
                                            height: `35px`,
                                            display: `flex`,
                                            alignItems: `center`,
                                            borderRadius: `0.75em`,
                                        }}
                                    >
                                        {user?.plan}
                                    </Badge>
                                </div>
                                <Dropdown className="dropdown ms-auto flex justify-center gap-1">
                                    <button className="sendbtn sharp" onClick={onShareProfile}>
                                        {SVGICON.Send}
                                    </button>
                                    {user?.plan !== "Premium" && (
                                        <Button
                                            size="sm"
                                            className="ms-2"
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
