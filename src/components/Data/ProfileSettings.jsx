
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Form, Badge } from "react-bootstrap";

const ProfileSettings = ({ user, onUpdateProfile, onPasswordChange }) => {
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        name: "",
        email: "",
        age: "",
        city: "",
        country: "",
        about: "",
        skills: [],
        languages: [],
    });

    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [newSkill, setNewSkill] = useState("");
    const [newLanguage, setNewLanguage] = useState("");

    // Initialize form data when user prop changes
    useEffect(() => {
        if (user) {
            // We need to be careful mapping 'user' prop to form data
            // The user prop passed here might be the processed 'user' object from UserPage 
            // which has a slightly different structure than the API response 'me' object.
            // However, looking at UserPage, 'user' object is derived from 'me' or 'profileFormData'.
            // Ideally we should pass the raw 'me' object or specific fields.
            // Let's assume 'user' here contains the fields we need, or we rely on 'me' being passed.
            // To be safe, let's expect the parent to pass the "me" object or equivalent data structure.
            setProfileFormData({
                name: user.name || "",
                email: user.email || "",
                age: user.age || "",
                city: user.city || user.location?.city || "",
                country: user.country || user.location?.country || "",
                about: user.about || user.info?.about || "",
                skills: user.skills || user.info?.skills || [],
                languages: user.languages || user.info?.languages || [],
            });
        }
    }, [user]);

    const handleProfileFormChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onUpdateProfile(profileFormData);
        setEditingProfile(false);
    };

    const handleAddSkill = () => {
        const v = newSkill.trim();
        if (v && !profileFormData.skills.includes(v)) {
            setProfileFormData((prev) => ({ ...prev, skills: [...prev.skills, v] }));
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (s) =>
        setProfileFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((x) => x !== s),
        }));

    const handleAddLanguage = () => {
        const v = newLanguage.trim();
        if (v && !profileFormData.languages.includes(v)) {
            setProfileFormData((prev) => ({
                ...prev,
                languages: [...prev.languages, v],
            }));
            setNewLanguage("");
        }
    };

    const handleRemoveLanguage = (l) =>
        setProfileFormData((prev) => ({
            ...prev,
            languages: prev.languages.filter((x) => x !== l),
        }));

    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target;
        setPasswordFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            alert("New password and confirmation do not match");
            return;
        }
        await onPasswordChange({
            currentPassword: passwordFormData.currentPassword,
            newPassword: passwordFormData.newPassword
        });
        setShowPasswordForm(false);
        setPasswordFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    return (
        <div className="pt-3">
            <Row>
                <Col lg={12}>
                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="text-primary mb-0">Profile Information</h5>
                            <Button
                                variant={editingProfile ? "secondary" : "primary"}
                                size="sm"
                                onClick={() => setEditingProfile(!editingProfile)}
                            >
                                <i className={`fa ${editingProfile ? "fa-times" : "fa-edit"} me-1`}></i>
                                {editingProfile ? "Cancel" : "Edit Profile"}
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Full Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={profileFormData.name}
                                                onChange={handleProfileFormChange}
                                                disabled={!editingProfile}
                                                placeholder="Enter your full name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={profileFormData.email}
                                                onChange={handleProfileFormChange}
                                                disabled={!editingProfile}
                                                placeholder="Enter your email"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Age</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="age"
                                                value={profileFormData.age}
                                                onChange={handleProfileFormChange}
                                                disabled={!editingProfile}
                                                placeholder="Enter your age"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={profileFormData.city}
                                                onChange={handleProfileFormChange}
                                                disabled={!editingProfile}
                                                placeholder="Enter your city"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Country</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="country"
                                                value={profileFormData.country}
                                                onChange={handleProfileFormChange}
                                                disabled={!editingProfile}
                                                placeholder="Enter your country"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>About Me</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="about"
                                        value={profileFormData.about}
                                        onChange={handleProfileFormChange}
                                        disabled={!editingProfile}
                                        placeholder="Tell us about yourself..."
                                    />
                                </Form.Group>

                                {/* Skills */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Skills</Form.Label>
                                    <div className="mb-2">
                                        {(profileFormData.skills || []).map((skill, index) => (
                                            <Badge
                                                key={index}
                                                bg="primary"
                                                className="me-2 mb-2 d-inline-flex align-items-center"
                                                style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
                                            >
                                                {skill}
                                                {editingProfile && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 ms-2 text-white"
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        style={{ fontSize: "0.75rem" }}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </Button>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                    {editingProfile && (
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                placeholder="Add a new skill"
                                                className="me-2"
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                                                }
                                            />
                                            <Button variant="outline-primary" onClick={handleAddSkill}>
                                                <i className="fa fa-plus"></i>
                                            </Button>
                                        </div>
                                    )}
                                </Form.Group>

                                {/* Languages */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Languages</Form.Label>
                                    <div className="mb-2">
                                        {(profileFormData.languages || []).map((language, index) => (
                                            <Badge
                                                key={index}
                                                bg="success"
                                                className="me-2 mb-2 d-inline-flex align-items-center"
                                                style={{ fontSize: "0.875rem", padding: "0.5rem 0.75rem" }}
                                            >
                                                {language}
                                                {editingProfile && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 ms-2 text-white"
                                                        onClick={() => handleRemoveLanguage(language)}
                                                        style={{ fontSize: "0.75rem" }}
                                                    >
                                                        <i className="fa fa-times"></i>
                                                    </Button>
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                    {editingProfile && (
                                        <div className="d-flex">
                                            <Form.Control
                                                type="text"
                                                value={newLanguage}
                                                onChange={(e) => setNewLanguage(e.target.value)}
                                                placeholder="Add a new language"
                                                className="me-2"
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" && (e.preventDefault(), handleAddLanguage())
                                                }
                                            />
                                            <Button variant="outline-success" onClick={handleAddLanguage}>
                                                <i className="fa fa-plus"></i>
                                            </Button>
                                        </div>
                                    )}
                                </Form.Group>

                                {editingProfile && (
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => setEditingProfile(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button variant="primary" type="submit">
                                            <i className="fa fa-save me-1"></i>
                                            Save Changes
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Security */}
            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="text-primary mb-0">Security Settings</h5>
                            <Button
                                variant={showPasswordForm ? "secondary" : "warning"}
                                size="sm"
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                            >
                                <i className={`fa ${showPasswordForm ? "fa-times" : "fa-key"} me-1`}></i>
                                {showPasswordForm ? "Cancel" : "Change Password"}
                            </Button>
                        </Card.Header>
                        {showPasswordForm && (
                            <Card.Body>
                                <Form onSubmit={handlePasswordSubmit}>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Current Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showPasswords.current ? "text" : "password"}
                                                        name="currentPassword"
                                                        value={passwordFormData.currentPassword}
                                                        onChange={handlePasswordFormChange}
                                                        placeholder="Enter your current password"
                                                        required
                                                    />
                                                    <span
                                                        className={`fa fa-fw ${showPasswords.current ? "fa-eye-slash" : "fa-eye"
                                                            } field-icon`}
                                                        style={{
                                                            position: "absolute",
                                                            right: "10px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                            color: "#ccc",
                                                        }}
                                                        onClick={() =>
                                                            setShowPasswords((prev) => ({
                                                                ...prev,
                                                                current: !prev.current,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>New Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showPasswords.new ? "text" : "password"}
                                                        name="newPassword"
                                                        value={passwordFormData.newPassword}
                                                        onChange={handlePasswordFormChange}
                                                        placeholder="Enter new password"
                                                        required
                                                        minLength={6}
                                                    />
                                                    <span
                                                        className={`fa fa-fw ${showPasswords.new ? "fa-eye-slash" : "fa-eye"
                                                            } field-icon`}
                                                        style={{
                                                            position: "absolute",
                                                            right: "10px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                            color: "#ccc",
                                                        }}
                                                        onClick={() =>
                                                            setShowPasswords((prev) => ({
                                                                ...prev,
                                                                new: !prev.new,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                                <Form.Text className="text-muted">
                                                    Password must be at least 6 characters long.
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirm New Password</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type={showPasswords.confirm ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={passwordFormData.confirmPassword}
                                                        onChange={handlePasswordFormChange}
                                                        placeholder="Confirm new password"
                                                        required
                                                        minLength={6}
                                                    />
                                                    <span
                                                        className={`fa fa-fw ${showPasswords.confirm ? "fa-eye-slash" : "fa-eye"
                                                            } field-icon`}
                                                        style={{
                                                            position: "absolute",
                                                            right: "10px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            cursor: "pointer",
                                                            color: "#ccc",
                                                        }}
                                                        onClick={() =>
                                                            setShowPasswords((prev) => ({
                                                                ...prev,
                                                                confirm: !prev.confirm,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="secondary"
                                            className="me-2"
                                            onClick={() => setShowPasswordForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button variant="warning" type="submit">
                                            <i className="fa fa-key me-1"></i>
                                            Change Password
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfileSettings;
