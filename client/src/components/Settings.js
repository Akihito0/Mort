import React, { useState, useEffect } from 'react';
import {
  auth,
  db,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from '../firestore-database/firebase';
import '../styles/Settings.css';

function Settings({ onPhotoUpdate }) {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    city: '',
    country: '',
    password: '********',
    photoData: '',
    canChangePassword: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const docRef = doc(db, 'Morts-User', currentUser.uid);
        const docSnap = await getDoc(docRef);
        const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
        const googlePhoto = currentUser.photoURL;

        const displayName = currentUser.displayName || '';
        const [firstName, lastName] = displayName.split(' ');

        const firestoreData = docSnap.exists() ? docSnap.data() : {};

        setUserData(prev => ({
          ...prev,
          firstName: firestoreData.firstName || firstName || '',
          lastName: firestoreData.lastName || lastName || '',
          email: firestoreData.email || currentUser.email,
          contact: firestoreData.contact || '',
          city: firestoreData.city || '',
          country: firestoreData.country || '',
          photoData: firestoreData.photoData || (isGoogle ? googlePhoto : ''),
          provider: isGoogle ? 'google' : 'email',
          canChangePassword: !isGoogle,
        }));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'Morts-User', currentUser.uid);

      try {
        await updateDoc(userDocRef, { photoData: base64String });
        setUserData(prev => ({ ...prev, photoData: base64String }));
        if (onPhotoUpdate) onPhotoUpdate(base64String);
      } catch (error) {
        console.error('Error saving photo to Firestore:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userDocRef = doc(db, 'Morts-User', currentUser.uid);
      await updateDoc(userDocRef, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        contact: userData.contact,
        city: userData.city,
        country: userData.country,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      alert('Password updated successfully!');
      setShowPassModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // For Google users, we can't reauthenticate with password, so we'll just delete the Firestore data
      if (userData.provider === 'google') {
        // Delete user data from Firestore
        const userDocRef = doc(db, 'Morts-User', currentUser.uid);
        await deleteDoc(userDocRef);
        
        // Sign out the user
        await auth.signOut();
        alert('Account deleted successfully. You will be redirected to the login page.');
        window.location.href = '/';
        return;
      }

      // For email users, reauthenticate first
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Delete user data from Firestore
      const userDocRef = doc(db, 'Morts-User', currentUser.uid);
      await deleteDoc(userDocRef);
      
      // Delete the user account
      await deleteUser(currentUser);
      
      alert('Account deleted successfully. You will be redirected to the login page.');
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account: ' + error.message);
    }
  };

  return (
    <div className="main-container">
      <div className="todo-app">
        <div className="header">
          <h2>Account Details</h2>
        </div>

        <div className="card">
          <div className="settings-content">
            <div className="settings-item vertical">
              <div className="settings-left-panel">
                <div className="profile-picture-section">
                  <img
                    src={userData.photoData || "images/logo.png"}
                    alt="Profile"
                    id="profile-img"
                    onClick={() => setShowModal(true)}
                  />
                  <label htmlFor="upload-profile" className="upload-label">Change Photo</label>
                  <input
                    type="file"
                    id="upload-profile"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <div className="profile-header">
                  <div className="profile-info">
                    <h3>{userData.firstName} {userData.lastName}</h3>
                    <p>{userData.email}</p>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn btn-edit" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                  </button>
                  <button className="btn btn-delete" onClick={() => setShowDeleteModal(true)}>
                    Delete Account
                  </button>
                </div>

                <div className="account-details">
                  <div className="input-group">
                    <label>Email</label>
                    <input type="text" name="email" value={userData.email} readOnly />
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div className="password-field">
                      <input type="password" value="********" readOnly />
                      {userData.canChangePassword ? (
                        <button className="btn-change-password" onClick={() => setShowPassModal(true)}>
                          Change
                        </button>
                      ) : (
                        <span className="password-note">Signed in with Google</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-right-panel">
                <div className="address-info">
                  <h4>Contact Information</h4>
                  <div className="input-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      name="contact"
                      value={userData.contact}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={userData.city}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="input-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={userData.country}
                      onChange={handleInputChange}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="edit-actions">
                    <button className="btn btn-save" onClick={handleSave}>Save Changes</button>
                    <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowModal(false)} className="close-modal">×</button>
              <img src={userData.photoData || "images/logo.png"} alt="Full Profile" />
            </div>
          </div>
        )}

        {showPassModal && (
            <div className="modal-overlay" onClick={() => setShowPassModal(false)}>
              <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Change Password</h3>
                <form onSubmit={(e) => { e.preventDefault(); handlePasswordUpdate(); }}>
                  <div className="input-group password-box">
                    <label>Current Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <i
                        className={`ri-eye${showPassword ? '' : '-off'}-fill eye-icon`}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                    </div>
                  </div>

                  <div className="input-group password-box">
                    <label>New Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <i
                        className={`ri-eye${showPassword ? '' : '-off'}-fill eye-icon`}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                    </div>
                  </div>

                  <div className="input-group password-box">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <i
                        className={`ri-eye${showPassword ? '' : '-off'}-fill eye-icon`}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-save">Save</button>
                    <button type="button" className="btn btn-cancel" onClick={() => setShowPassModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Account</h3>
              <div className="delete-warning">
                <p><strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.</p>
                <p>This includes:</p>
                <ul>
                  <li>Your profile information</li>
                  <li>All your notes and documents</li>
                  <li>Quiz history and saved quizzes</li>
                  <li>Todo lists and calendar events</li>
                  <li>All other personal data</li>
                </ul>
              </div>
              
              {userData.provider !== 'google' && (
                <div className="input-group password-box">
                  <label>Current Password (Required)</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <i
                      className={`ri-eye${showPassword ? '' : '-off'}-fill eye-icon`}
                      onClick={() => setShowPassword(!showPassword)}
                    ></i>
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Type "DELETE" to confirm</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-delete-confirm" 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                >
                  Delete Account
                </button>
                <button 
                  type="button" 
                  className="btn btn-cancel" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setCurrentPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
