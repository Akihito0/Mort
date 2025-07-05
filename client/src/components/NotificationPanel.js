import React, { useState, useEffect } from 'react';
import { auth, db, collection, onSnapshot, getDoc, setDoc, doc  } from '../firestore-database/firebase';
import '../styles/NotificationPanel.css';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [readStatus, setReadStatus] = useState({});
  const [showPanel, setShowPanel] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let unsubscribeSnapshot;

    const setupSnapshot = (user) => {
      const userName = user.displayName || user.uid;
      const taskRef = collection(db, 'Mort-Task', userName, 'Task');

      unsubscribeSnapshot = onSnapshot(taskRef, (snapshot) => {
        const now = new Date();

        const newNotifs = snapshot.docs.flatMap((docSnap) => {
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

          const dueKey = dueDate ? dueDate.toISOString().split('T')[0] : 'no-due';
          const statusKey = data.status || 'no-status';
          const notifIdBase = `${docSnap.id}-${statusKey}-${dueKey}`;

          return messages.map((msg) => ({
            id: `${notifIdBase}-${msg.slice(0, 10)}`, // more unique and dynamic
            message: msg,
            time: formattedTime,
            dot: statusDot,
            taskId: docSnap.id,
          }));
        });

        const statusDocRef = doc(db, 'Mort-Task', userName, 'NotificationReadStatus', 'status');
          getDoc(statusDocRef).then((docSnap) => {
            const readData = docSnap.exists() ? docSnap.data().readNotifs || [] : [];
            const readMap = {};
            readData.forEach(id => readMap[id] = true);
            setReadStatus(readMap);
            setNotifications(newNotifs);
          });
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

  const markAsRead = async (notifId) => {
    if (isRead(notifId)) return;

    setReadStatus((prev) => ({
      ...prev,
      [notifId]: true,
    }));

    const user = auth.currentUser;
    if (!user) return;

    const userName = user.displayName || user.uid;
    const statusDocRef = doc(db, 'Mort-Task', userName, 'NotificationReadStatus', 'status');

    try {
      const statusSnap = await getDoc(statusDocRef);
      let readNotifs = statusSnap.exists() ? statusSnap.data().readNotifs || [] : [];

      if (!readNotifs.includes(notifId)) {
        readNotifs.push(notifId);
        await setDoc(statusDocRef, { readNotifs }, { merge: true });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const isRead = (notifId) => readStatus[notifId] === true;

  const filteredNotifications = filter === 'All'
    ? notifications
    : notifications.filter((n) => !isRead(n.id));

  const unreadCount = notifications.filter((n) => !isRead(n.id)).length;

  return (
    <div className="notification-wrapper">
      <button className="notif-button" onClick={() => setShowPanel(!showPanel)}>
        <i className="bx bx-bell"></i>
        {unreadCount > 0 && (
          <span className="notif-count">{unreadCount}</span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="notif-tabs">
            <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All</button>
            <button className={filter === 'Unread' ? 'active' : ''} onClick={() => setFilter('Unread')}>Unread</button>
          </div>

          {filteredNotifications.length === 0 ? (
            <p className="no-notif">No {filter.toLowerCase()} notifications</p>
          ) : (
            <ul>
              {filteredNotifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`notif-item ${!isRead(notif.id) ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
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
