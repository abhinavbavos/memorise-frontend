import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Spinner } from "react-bootstrap";
import { SVGICON } from "../../data/constant/theme";
import { resolveImageUrl } from "../../utils/urlHelpers";

function DropBtnBlog({ user }) {
    return (
        <Dropdown className="custom-dropdown mb-0">
            <Dropdown.Toggle
                className="btn sharp tp-btn dark-btn i-false d-flex align-items-center justify-center"
                as="div"
            >
                {SVGICON.DropDots}
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right" align="end">
                <Dropdown.Item
                    as={Link}
                    to={`/admin/users?search=${encodeURIComponent(user?.email || "")}`}
                    eventKey="Details"
                >
                    Details
                </Dropdown.Item>
                <Dropdown.Item className="text-primary" eventKey="Cancel">
                    Cancel
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}

const RecentUsersList = ({ users, loading, onViewMore }) => {
    return (
        <div className="col-xl-6">
            <div className="card">
                <div className="card-header border-0 pb-0">
                    <h3 className="h-title">Recently Joined</h3>
                </div>
                <div className="card-body px-0 pb-0">
                    <div className="dz-scroll recent-customer">
                        {loading ? (
                            <div className="p-3 text-center">
                                <Spinner />
                            </div>
                        ) : users.length ? (
                            users.map((u) => (
                                <div key={u._id} className="d-flex custome-list justify-between align-items-center mb-3">
                                    <Link to={`/profile/${u.publicId || u._id}`} className="d-flex align-items-center w-100 text-decoration-none">
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={resolveImageUrl(u.avatarUrl) || "/placeholder.svg"}
                                                className="avatar"
                                                alt={u.name}
                                                style={{ objectFit: "cover" }}
                                            />
                                            <div className="ms-2">
                                                <h6 className="mb-0">
                                                    <span className="text-dark">{u.name}</span>
                                                </h6>
                                                <p className="mb-0 text-muted small">{u.email}</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="ms-auto">
                                        <DropBtnBlog user={u} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-muted text-center">No recent users</div>
                        )}
                    </div>
                </div>
                <div className="card-footer border-0">
                    <button
                        type="button"
                        className="btn btn-primary btn-block mb-2"
                        onClick={onViewMore}
                    >
                        View More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecentUsersList;
