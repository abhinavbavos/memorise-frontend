import React from "react";
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

const RecentSubscriptionsList = ({ subscriptions, loading, onViewMore }) => {
    return (
        <div className="col-xl-6">
            <div className="card">
                <div className="card-header border-0 pb-0">
                    <h3 className="h-title">Recently Subscribed</h3>
                </div>
                <div className="card-body px-0 pb-0">
                    <div className="dz-scroll recent-customer">
                        {loading ? (
                            <div className="p-3 text-center">
                                <Spinner />
                            </div>
                        ) : subscriptions.length ? (
                            subscriptions.map((s) => (
                                <div key={s._id}>
                                    <ul className="d-flex custome-list justify-between">
                                        <div className="d-flex">
                                            <li>
                                                <div
                                                    className="avatar d-flex align-items-center justify-content-center bg-primary text-white"
                                                    style={{
                                                        borderRadius: "50%",
                                                        width: 48,
                                                        height: 48,
                                                    }}
                                                >
                                                    {(s.userId?.name || "?").slice(0, 1).toUpperCase()}
                                                </div>
                                            </li>
                                            <li className="ms-2">
                                                <h6 className="mb-0">
                                                    <span className="text-dark">
                                                        {s.userId?.name || "User"}
                                                    </span>
                                                </h6>
                                                <p className="mb-0 text-muted small">
                                                    {s.amount != null
                                                        ? Number(s.amount).toLocaleString(undefined, {
                                                            style: "currency",
                                                            currency: s.currency || "INR",
                                                        })
                                                        : "-"}{" "}
                                                    •{" "}
                                                    {s.createdAt
                                                        ? new Date(s.createdAt).toLocaleDateString()
                                                        : ""}
                                                </p>
                                            </li>
                                        </div>
                                        <DropBtnBlog />
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-muted text-center">
                                No recent subscriptions
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-footer border-0">
                    <button
                        type="button"
                        className="btn btn-primary btn-block mb-2"
                        onClick={onViewMore}
                    >
                        View Subscriptions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecentSubscriptionsList;
