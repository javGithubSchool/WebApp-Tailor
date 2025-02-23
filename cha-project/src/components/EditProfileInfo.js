import React, { useState, useEffect } from 'react';
import styles from '../styles/EditProfileInfo.module.css';
import { IoClose } from 'react-icons/io5';
import { jwtDecode } from 'jwt-decode';

const EditProfileInfo = ({ isVisible, onClose, fieldToEdit, initialValue, userId, onUpdateProfile }) => {
    const [value, setValue] = useState(initialValue || ''); // Set initial value for input
    const [currentPassword, setCurrentPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mouseDownInside, setMouseDownInside] = useState(false);

    const token = sessionStorage.getItem("authToken")

    const titleMap = {
        name: 'Change Name',
        email: 'Change Email',
        phone: 'Change Phone Number',
        address_line1: 'Change Address',
        industry: 'Change Industry',
        password: 'Change Password',
    };

    const title = titleMap[fieldToEdit] || '';
    const inputType = fieldToEdit === 'password' ? 'password' : 'text';
    const placeholder = fieldToEdit === 'password'
        ? 'Enter new password'
        : `Enter new ${fieldToEdit}`;

    // Ensure the initial value is reset each time the modal is shown
    useEffect(() => {
        if (isVisible) {
            setValue(initialValue || ''); // Set the initial value for the input field
            setCurrentPassword('');
            setConfirmPassword('');
        }
    }, [initialValue, fieldToEdit, isVisible]);

    const handleMouseDown = (e) => {
        if (e.target.closest(`.${styles.popupContent}`)) {
            setMouseDownInside(true);
        } else {
            setMouseDownInside(false);
        }
    };

    const handleMouseUp = (e) => {
        if (!mouseDownInside && !e.target.closest(`.${styles.popupContent}`)) {
            onClose();
        }
        setMouseDownInside(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!fieldToEdit || !userId) {
            alert('Missing field or user ID');
            return;
        }

        // Ensure new password and confirm password match
        if (fieldToEdit === 'password' && value !== confirmPassword) {
            alert('New password and confirm password must match.');
            return;
        }

        // Verify current password for email or password changes
        if ((fieldToEdit === 'email' || fieldToEdit === 'password') && currentPassword) {
            try {
                const verifyResponse = await fetch('http://localhost:3000/api/org/verify-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ org_id: userId, currentPassword }),
                });

                if (!verifyResponse.ok) {
                    const verifyResult = await verifyResponse.json();
                    alert(`Password verification failed: ${verifyResult.error || 'Unknown error'}`);
                    return;
                }
            } catch (error) {
                console.error('Error verifying password:', error);
                alert('Failed to verify password. Please try again.');
                return;
            }
        }

        // Proceed with the update
        try {
            const payload = { [fieldToEdit]: value };
            const response = await fetch(`http://localhost:3000/api/org/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                const { token } = data;

                sessionStorage.setItem('token', token);
                localStorage.setItem('token', token);

                const decodedToken = jwtDecode(token);
                const updatedDetails = {};
                if (fieldToEdit === 'name') updatedDetails.userName = decodedToken.org_name;
                if (fieldToEdit === 'email') updatedDetails.userEmail = decodedToken.email;
                if (fieldToEdit === 'phone') updatedDetails.userPhone = decodedToken.org_phone;
                if (fieldToEdit === 'industry') updatedDetails.orgIndustry = decodedToken.industry;
                if (fieldToEdit === 'address_line1') updatedDetails.userAddress1 = decodedToken.address;

                onUpdateProfile(updatedDetails);
                alert('Profile updated successfully');
                onClose();
            } else {
                alert(`Failed to update profile: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={styles.popupOverlay}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.forgetPasswordTop}>
                    <p className={styles.editingTitle}>{title}</p>
                    <IoClose className={styles.closeIcon} onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    {fieldToEdit !== 'industry' ? (
                        <input
                            type={inputType}
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    ) : (
                        <div className={styles.selectWrapper}>
                            <select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                required
                                className={styles.industryDropdown}
                            >
                                <option value="" disabled selected>Select Industry</option>
                                <option value="Technology">Technology</option>
                                <option value="Finance">Finance</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Manufacturing">Manufacturing</option>
                                <option value="Retail">Retail</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Transportation and Logistics">Transportation and Logistics</option>
                                <option value="Construction">Construction</option>
                                <option value="Marketing and Advertising">Marketing and Advertising</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                    )}
                    {fieldToEdit === 'password' && (
                        <>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={styles.inputField}
                            />
                        </>
                    )}
                    {(fieldToEdit === 'email' || fieldToEdit === 'password') && (
                        <input
                            type="password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            className={styles.inputField}
                        />
                    )}
                    <div className={styles.inputUnderline}></div>
                    <button className={styles.forgetPasswordButton} type="submit">
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileInfo;