import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { IMAGES } from '../../data/constant/theme';
import { resolveImageUrl } from "../../utils/urlHelpers";

const PostList = ({ user, posts, onCameraClick, onPostModalClick }) => {
    return (
        <div className="col-lg-12">
            {/* Create Post Input */}
            <div className="card shadow-sm border-0 mb-4 rounded-4">
                <div className="card-body p-3">
                    {/* Top row: Avatar + Input trigger */}
                    <div className="d-flex align-items-center mb-3">
                        <img
                            src={resolveImageUrl(user?.avatarUrl || user?.avatar || user?.thumbUrl) || "/placeholder.svg"}
                            alt="Me"
                            className="rounded-circle me-2 border"
                            style={{ width: 45, height: 45, objectFit: "cover" }}
                        />
                        <div
                            className="flex-grow-1 bg-light rounded-pill px-4 py-2 text-muted cursor-pointer hover-bg-gray border-0 shadow-sm"
                            style={{ cursor: "pointer", fontSize: "0.95rem", transition: "0.2s" }}
                            onClick={onPostModalClick}
                        >
                            What's on your mind, {user?.name?.split(" ")[0]}?
                        </div>
                    </div>

                    <div className="border-top my-2"></div>

                    {/* Bottom row: actions */}
                    <div className="d-flex justify-content-around pt-2">
                        <button
                            className="btn btn-light bg-transparent border-0 d-flex align-items-center gap-2 text-secondary flex-grow-1 justify-content-center"
                            onClick={onCameraClick}
                        >
                            <i className="fa fa-camera text-danger f-s-18"></i>
                            <span className="d-none d-sm-inline font-w500">Camera</span>
                        </button>

                        <button
                            className="btn btn-light bg-transparent border-0 d-flex align-items-center gap-2 text-secondary flex-grow-1 justify-content-center"
                            onClick={onPostModalClick}
                        >
                            <i className="fa fa-image text-success f-s-18"></i>
                            <span className="d-none d-sm-inline font-w500">Photo/Video</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts Feed removed as per user request */}
        </div>
    );
};

export default PostList;
