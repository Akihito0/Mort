import React, { useState, useEffect } from 'react';
import { auth, db, doc, getDoc } from '../firestore-database/firebase';
import '../styles/Settings.css';

function Settings() {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    email: '',
    provider: '',
    uid: '',
    createdAt: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const docRef = doc(db, 'Morts-User', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="main-container">
      <div className="todo-app">
        <div className="header">
          <h2>Account Details</h2>
        </div>

        <div className="card">
          <div className="settings-content">
            <div className="settings-item vertical">

              <div className="settings-sidebar">
                <div className="card">
                  <button className="btn primary">Account</button> <br />
                  <button className="btn secondary">Appearance</button>
                </div>
              </div>

              <div className="settings-content">
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" id="first-name" placeholder="First Name" value={userData.name} readOnly />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" id="last-name" placeholder="Last Name" value={userData.surname} readOnly />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="text" id="email" placeholder="Email@email.com" value={userData.email} readOnly />
                </div>
              </div>

              <div className="setting-sidebar">
                <div className="profile-picture-section">
                  <img src="images/default-profile.png" alt="Profile" id="profile-img" />
                  <input type="file" id="upload-profile" accept="image/*" />

                  <button className="btn primary">Change Password</button>
                  <button className="btn secondary">Change Email</button>
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
