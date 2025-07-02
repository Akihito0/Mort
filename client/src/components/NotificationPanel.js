import React, { useState, useEffect } from 'react';
import { auth, db, collection, onSnapshot } from '../firestore-database/firebase';
import '../styles/NotificationPanel.css';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot;

    const setupSnapshot = (user) => {
      const userName = user.displayName || user.uid;
      const taskRef = collection(db, 'Mort-Task', userName, 'Task');

      unsubscribeSnapshot = onSnapshot(taskRef, (snapshot) => {
        const now = new Date();

        const newNotifications = snapshot.docs.flatMap((docSnap) => {
          const data = docSnap.data();
          const dueDate = data.dueDate ? new Date(data.dueDate) : null;
          const messages = [];

          let statusDot = 'gray';

          if (data.status === 'Not Started') {
            messages.push(`"${data.title}" hasn't been started yet.`);
            statusDot = 'yellow';
          }

          if (dueDate) {
            const timeDiff = dueDate - now;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            if (dueDate < now) {
              messages.push(`"${data.title}" is past due (${formatDate(dueDate)}).`);
              statusDot = 'red';
            } else if (daysDiff === 0) {
              messages.push(`"${data.title}" is due today (${formatDate(dueDate)}).`);
              statusDot = 'orange';
            } else if (daysDiff === 1) {
              messages.push(`"${data.title}" is due tomorrow (${formatDate(dueDate)}).`);
              statusDot = 'orange';
            } else if (daysDiff <= 3) {
              messages.push(`"${data.title}" is near its deadline (${formatDate(dueDate)}).`);
              statusDot = 'blue';
            }
          }

          const formattedTime = formatTimeAgo(data.created ? new Date(data.created) : new Date());

          return messages.map((msg) => ({
            id: docSnap.id + '-' + msg.slice(0, 10),
            message: msg,
            time: formattedTime,
            dot: statusDot,
          }));
        });

        setNotifications(newNotifications);
      });
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setupSnapshot(user);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / (86400000 * 7));

    if (minutes < 60) return 'Now';
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return `${weeks}w`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="notification-wrapper">
      <button className="notif-button" onClick={() => setShowPanel(!showPanel)}>
        <i className="bx bx-bell"></i>
        {notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p className="no-notif">No notifications</p>
          ) : (
            <ul>
              {notifications.map((notif, index) => (
                <li key={index}>
                  <div className="notif-header">
                    <span className={`dot ${notif.dot}`}></span>
                    <span className="notif-message">{notif.message}</span>
                  </div>
                  <span className="notif-time">{notif.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
