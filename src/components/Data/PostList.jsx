import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'react-bootstrap';
import { IMAGES } from '../../data/constant/theme';
import { resolveImageUrl } from "../../utils/urlHelpers";

const PostList = ({ user, onCameraClick, onPostModalClick }) => {
    return (
        <div className="card shadow-sm border-0">
            <div className="card-body p-3">
                {/* Top row: Avatar + Input trigger */}
                <div className="d-flex align-items-center mb-3">
                    <img
                        src={resolveImageUrl(user?.avatarUrl) || "/placeholder.svg"}
                        alt="Me"
                        className="rounded-circle me-2"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                    />
                    <div
                        className="flex-grow-1 bg-light rounded-pill px-3 py-2 text-muted cursor-pointer hover-bg-gray"
                        style={{ cursor: "pointer", fontSize: "0.95rem" }}
                        onClick={onPostModalClick}
                    >
                        What's on your mind, {user?.name?.split(" ")[0]}?
                    </div>
                </div>

                <div className="border-top my-2"></div>

                {/* Bottom row: actions */}
                <div className="d-flex justify-content-around pt-2">
                    <button
                        className="btn btn-light border-0 d-flex align-items-center gap-2 text-secondary flex-grow-1 justify-content-center"
                        onClick={onCameraClick}
                    >
                        <i className="fa fa-camera text-danger f-s-18"></i>
                        <span className="d-none d-sm-inline font-w500">Camera</span>
                    </button>

                    <button
                        className="btn btn-light border-0 d-flex align-items-center gap-2 text-secondary flex-grow-1 justify-content-center"
                        onClick={onPostModalClick}
                    >
                        <i className="fa fa-image text-success f-s-18"></i>
                        <span className="d-none d-sm-inline font-w500">Photo/Video</span>
                    </button>

                    <button
                        className="btn btn-light border-0 d-flex align-items-center gap-2 text-secondary flex-grow-1 justify-content-center"
                        onClick={onPostModalClick}
                    >
                        <i className="fa fa-smile-o text-warning f-s-18"></i>
                        <span className="d-none d-sm-inline font-w500">Feeling/Activity</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostList;
