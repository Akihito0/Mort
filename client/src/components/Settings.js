import React from 'react';
import '../styles/Settings.css';

function Settings() {
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
                <input type="text" id="first-name" placeholder="First Name" />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" id="last-name" placeholder="Last Name" />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input type="text" id="surname" placeholder="Email@email.com" />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="text" id="last-name" placeholder="Password" />
              </div></div>
              
              
              
              <div className="setting-sidebar">
               <div className="settings-centering">
                <div className="profile-picture-section">
                  
                <img src="images/default-profile.png" alt="Profile" id="profile-img" />
                <div className='setting-photoupload'>
                  <input type="file" id="upload-profile" accept="image/*"  />
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
