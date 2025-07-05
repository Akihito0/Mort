import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc, updateDoc } from '../firestore-database/firebase';
import '../styles/Settings.css';

function Settings({ onPhotoUpdate }) {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    email: '',
    provider: '',
    uid: '',
    createdAt: '',
    photoData: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const docRef = doc(db, 'Morts-User', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
          const googlePhoto = currentUser.photoURL;

          setUserData({
            ...data,
            email: maskEmail(data.email),
            photoData: data.photoData || (isGoogle ? googlePhoto : ''),
            provider: isGoogle ? 'google' : 'email',
          });
        } else {
          console.log('No such document!');
        }
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

        // 🔥 Immediately update sidebar
        if (onPhotoUpdate) onPhotoUpdate(base64String);
      } catch (error) {
        console.error('Error saving photo to Firestore:', error);
      }
    };

    reader.readAsDataURL(file);
  };

  // 📌 Function to partially mask email
  const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    const maskedUser = user.length > 2
      ? user.slice(0, 2) + '*'.repeat(user.length - 4) + user.slice(-2)
      : user[0] + '*';
    return `${maskedUser}@${domain}`;
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
              <div className="settings-content">
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" value={userData.name} readOnly />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" value={userData.surname} readOnly />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="text" value={userData.email} readOnly />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="********" readOnly />
                </div>
              </div>

              <div className="setting-sidebar">
                <div className="settings-centering">
                  <div className="profile-picture-section">
                    <img
                      src={userData.photoData || "images/logo.png"}
                      alt="Profile"
                      id="profile-img"
                    />
                    <div className="setting-photoupload">
                      <input type="file" id="upload-profile" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>

                  <button className="btn">Delete Account</button>
                  <button className="btn">Update Info</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
