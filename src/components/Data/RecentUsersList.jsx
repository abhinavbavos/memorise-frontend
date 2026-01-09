import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Spinner } from "react-bootstrap";
import { SVGICON } from "../../data/constant/theme";

function DropBtnBlog() {
    return (
        <Dropdown className="custom-dropdown mb-0">
            <Dropdown.Toggle
                className="btn sharp tp-btn dark-btn i-false d-flex align-items-center justify-center"
                as="div"
            >
                {SVGICON.DropDots}
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-right" align="end">
                <Dropdown.Item eventKey="Details">Details</Dropdown.Item>
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
                                <Link key={u._id} to={`/profile/${u.publicId || u._id}`}>
                                    <ul className="d-flex custome-list justify-between">
                                        <div className="d-flex">
                                            <li>
                                                <img
                                                    src={u.avatarUrl || "/placeholder.svg"}
                                                    className="avatar"
                                                    alt={u.name}
                                                    style={{ objectFit: "cover" }}
                                                />
                                            </li>
                                            <li className="ms-2">
                                                <h6 className="mb-0">
                                                    <span className="text-dark">{u.name}</span>
                                                </h6>
                                                <p className="mb-0 text-muted small">{u.email}</p>
                                            </li>
                                        </div>
                                        <DropBtnBlog />
                                    </ul>
                                </Link>
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
