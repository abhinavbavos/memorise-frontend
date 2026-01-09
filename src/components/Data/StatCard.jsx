import React from "react";
import { Spinner } from "react-bootstrap";
import { iconBoxcard } from "../../data/constant/alldata";

const StatCard = ({ title, count, icon, loading, fmt }) => {
    return (
        <div className="col-xl-3 col-sm-6">
            <div className="card">
                <div className="card-body d-flex justify-content-between">
                    <div className="card-menu">
                        <span>{title}</span>
                        <h2 className="mb-0">
                            {loading ? (
                                <Spinner size="sm" />
                            ) : fmt ? (
                                fmt(count)
                            ) : (
                                count
                            )}
                        </h2>
                    </div>
                    <div className="icon-box icon-box-lg bg-primary-light d-flex align-items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
