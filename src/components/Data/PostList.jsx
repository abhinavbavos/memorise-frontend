import React from 'react';
import { resolveImageUrl } from "../../utils/urlHelpers";
import profile from "../../assets/images/profile/profile.png";
import { Ic } from "./profileIcons";

const PostList = ({ user, onCameraClick, onPostModalClick }) => {
    const firstName = user?.name?.split(" ")[0] || "there";
    return (
        <div>
            {/* Create-post composer */}
            <div className="pf-composer">
                <div className="pf-composer__top">
                    <img
                        src={resolveImageUrl(user?.avatarUrl || user?.avatar || user?.thumbUrl) || profile}
                        alt="Me"
                        className="pf-composer__avatar"
                    />
                    <button className="pf-composer__trigger" onClick={onPostModalClick}>
                        What's on your mind, {firstName}?
                    </button>
                </div>

                <div className="pf-composer__actions">
                    <button className="pf-composer__btn" onClick={onCameraClick}>
                        {Ic.camera}
                        <span className="d-none d-sm-inline">Camera</span>
                    </button>
                    <button className="pf-composer__btn" onClick={onPostModalClick}>
                        {Ic.image}
                        <span className="d-none d-sm-inline">Photo / Video</span>
                    </button>
                </div>
            </div>

            {/* Encouraging note */}
            <div className="pf-note">
                <span className="pf-note__ico">{Ic.sparkles}</span>
                <div>
                    <p className="pf-note__title">Share your latest achievement</p>
                    <p className="pf-note__sub">Add a trophy or memory and it shows up on your profile instantly.</p>
                </div>
            </div>
        </div>
    );
};

export default PostList;
