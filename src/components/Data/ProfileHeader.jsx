import React from "react";
import profile from "../../assets/images/profile/profile.png";
import { resolveImageUrl } from "../../utils/urlHelpers";
import { Ic } from "./profileIcons";

const ProfileHeader = ({
    user,
    coverUrl,
    avatarUrl,
    onCoverUpload,
    onAvatarUpload,
    onShareProfile,
    onSubscription,
}) => {
    const isPremium = user?.plan === "Premium";
    const hasCover = !!coverUrl;

    const city = user?.location?.city;
    const country = user?.location?.country;
    const place = [city, country].filter(Boolean).join(", ");

    return (
        <div className="pf-hero">
            {/* cover band */}
            <div
                className={`pf-cover ${hasCover ? "" : "pf-cover--fallback"}`}
                style={hasCover ? { backgroundImage: `url(${resolveImageUrl(coverUrl)})` } : undefined}
            >
                <div className="pf-cover__scrim" />
                <div className="pf-cover__actions">
                    <button className="pf-glass" onClick={onCoverUpload} title="Change cover photo">
                        {Ic.camera}
                        <span className="d-none d-sm-inline">Change cover</span>
                    </button>
                </div>
            </div>

            {/* identity row */}
            <div className="pf-hero__body">
                <div className="pf-avatar">
                    <img src={resolveImageUrl(avatarUrl) || profile} alt={user?.name || "avatar"} />
                    <button className="pf-avatar__edit" onClick={onAvatarUpload} title="Change avatar">
                        {Ic.camera}
                    </button>
                </div>

                <div className="pf-idblock">
                    <div className="pf-name">
                        <h1>{user?.name || "Your Name"}</h1>
                        <span className={`pf-plan ${isPremium ? "pf-plan--premium" : "pf-plan--basic"}`}>
                            {isPremium ? Ic.crown : null}
                            {user?.plan || "Basic Plan"}
                        </span>
                    </div>
                    <div className="pf-meta">
                        {place && <span className="pf-meta__item">{Ic.pin}{place}</span>}
                        {user?.email && <span className="pf-meta__item">{Ic.mail}{user.email}</span>}
                        {user?.memberSince && (
                            <span className="pf-meta__item">{Ic.calendar}Member since {user.memberSince}</span>
                        )}
                    </div>
                </div>

                <div className="pf-hero__cta">
                    <button className="ad-btn ad-btn--ghost" onClick={onShareProfile}>
                        {Ic.share} Share
                    </button>
                    {!isPremium && (
                        <button className="ad-btn ad-btn--primary" onClick={onSubscription}>
                            {Ic.crown} Upgrade
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
