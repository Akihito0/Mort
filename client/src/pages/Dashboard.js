import React, { useState, useEffect } from 'react';
import NotesTab from '../components/NotesTab.js';
import TodoDashboard from '../components/TodoDashboard.js';
import PdfTab from '../components/PdfTab.js';
import QuizMakerTab from '../components/QuizMakerTab.js';
import Settings from '../components/Settings.js';
import ChatbotWidget from '../components/ChatbotWidget.js';
import '../styles/dashboard.css';
import { signOut } from 'firebase/auth'; 
import { auth, onAuthStateChanged, db, doc, getDoc, collection, getDocs, onSnapshot } from '../firestore-database/firebase'; //Firebase auth instance
import { useNavigate } from 'react-router-dom'; 
import NotificationPanel from '../components/NotificationPanel.js'; 
import GlobalSearch from '../components/GlobalSearch.js';
import CalendarView from '../components/HomePageCalendar.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState([]);
  const [profileImage, setProfileImage] = useState('/images/logo.png');
  const [userName, setUserName] = useState(() => {
    // Get the name instantly if available from auth
    const user = auth.currentUser;
    return user ? (user.displayName || user.email || '') : '';
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [chatContext, setChatContext] = useState(null);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);

  }, [isDark]);

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUserName(user.displayName || user.email || 'User');

      try {
        const docRef = doc(db, 'Morts-User', user.uid);
        const docSnap = await getDoc(docRef);

        const providerId = user.providerData[0]?.providerId;
        const isGoogle = providerId === 'google.com';

        const firestorePhoto = docSnap.exists() ? docSnap.data().photoData : null;
        const googlePhoto = user.photoURL;

        if (firestorePhoto) {
          setProfileImage(firestorePhoto);
        } else if (isGoogle && googlePhoto) {
          setProfileImage(googlePhoto);
        } else {
          setProfileImage('/images/logo.png');
        }
      } catch (err) {
        console.error("Error fetching profile image:", err);
        setProfileImage('/images/logo.png');
      }
    } else {
      setUserName('');
      setProfileImage('/images/logo.png');
    }
  });

  return () => unsubscribe();
}, []);


  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
  try {
    await signOut(auth); 
    navigate('/');       
  } catch (error) {
    alert("Logout failed: " + error.message);
  }
  
};

  const handleNavClick = (tab) => {
    setActiveTab(tab);

    if (window.innerWidth <= 768) {
      setSidebarOpen(false); 
    }
  };

  /* For Home Page tasks fetching */
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const userName = user.displayName || user.uid;
  const snapshot = await getDocs(collection(db, 'Mort-Task', userName, 'Task'));
  const fetchedTasks = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
    dueDate: docSnap.data().dueDate || '',
    created: docSnap.data().created || '',
  }));
  setTasks(fetchedTasks);
};
const setupRealtimeActivityListener = (user) => {
  const userName = user.displayName || user.uid;

  const taskRef = collection(db, `Mort-Task/${userName}/Task`);
  const notesRef = collection(db, `Mort-Notes/${userName}/Notes`);
  const quizzesRef = collection(db, `Mort-Notes/${userName}/Quizzes`);
  const flashcardsRef = collection(db, `Mort-Notes/${userName}/Flashcard`);

  let activities = [];

  const updateRecentActivities = () => {
    const sorted = activities
      .filter(item => item.timestamp)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    setRecentActivities(sorted);
  };

  const unsubTasks = onSnapshot(taskRef, (taskSnap) => {
    const taskActivities = taskSnap.docs.map(doc => {
      const data = doc.data();
      return {
        type: 'Task',
        action: data.status === 'Completed' ? 'Completed' : 'Updated',
        title: data.title,
        timestamp: data.updatedAt || data.dueDate || data.created || new Date().toISOString(),
      };
    });
    activities = [...activities.filter(a => a.type !== 'Task'), ...taskActivities];
    updateRecentActivities();
  });

  const unsubNotes = onSnapshot(notesRef, (noteSnap) => {
    const noteActivities = noteSnap.docs.map(doc => {
      const data = doc.data();
      return {
        type: 'Note',
        action: 'Added',
        title: data.title,
        timestamp: data.created || new Date().toISOString(),
      };
    });
    activities = [...activities.filter(a => a.type !== 'Note'), ...noteActivities];
    updateRecentActivities();
  });

  const unsubQuizzes = onSnapshot(quizzesRef, (quizSnap) => {
    const quizActivities = quizSnap.docs.map(doc => {
      const data = doc.data();
      return {
        type: 'Quiz',
        action: 'Saved',
        title: data.title || doc.id,
        timestamp: data.updatedAt || data.createdAt || new Date().toISOString(),
      };
    });
    activities = [...activities.filter(a => a.type !== 'Quiz'), ...quizActivities];
    updateRecentActivities();
  });

  const unsubFlashcards = onSnapshot(flashcardsRef, (flashSnap) => {
    const flashActivities = flashSnap.docs.map(doc => {
      const data = doc.data();
      return {
        type: 'Flashcard',
        action: 'Saved',
        title: data.title || doc.id,
        timestamp: data.updatedAt || data.createdAt || new Date().toISOString(),
      };
    });
    activities = [...activities.filter(a => a.type !== 'Flashcard'), ...flashActivities];
    updateRecentActivities();
  });

  return () => {
    unsubTasks();
    unsubNotes();
    unsubQuizzes();
    unsubFlashcards();
  };
};


useEffect(() => {
  let activityUnsub = null;

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchTasks();
      activityUnsub = setupRealtimeActivityListener(user);
    }
  });

  return () => {
    unsubscribe();
    if (activityUnsub) activityUnsub(); // cleanup Firestore listener
  };
}, []);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'close'}`}>
        <a href="#" className="logo">
          <i className='bx bx-code-alt'></i>
          <div className="logo-name"><span>MO</span>RT</div>
        </a>
        <ul className="side-menu">
          <li className={activeTab === 'home' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>
              <i className='bx bxs-dashboard'></i>Home
            </a>
          </li>
          <li className={activeTab === 'notes' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('notes'); }}>
              <i className='bx bx-book'></i>Notes
            </a>
          </li>
          <li className={activeTab === 'todo' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('todo'); }}>
              <i className='bx bx-list-check'></i>To-Do
            </a>
          </li>
          <li className={activeTab === 'pdf' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('pdf'); }}>
              <i className='bx bx-file'></i>Text Extractor
            </a>
          </li>
          <li className={activeTab === 'quiz' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('quiz'); }}>
              <i className='bx bx-edit'></i>Quiz Maker
            </a>
          </li>

          <li className={activeTab === 'settings' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('settings'); }}>
              <i className='bx bx-cog'></i>Account
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="#" className="logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
              <i className='bx bx-log-out-circle'></i>Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <nav>
          <i className='bx bx-menu' onClick={() => setSidebarOpen(prev => !prev)}></i>
          <GlobalSearch
            onNavigate={(tab, item) => {
              const normalizedTab =
                tab === 'quizzes' ? 'quiz' :
                tab === 'tasks' ? 'todo' :
                tab;
              setActiveTab(normalizedTab);
            }}
          />

          <input
            type="checkbox"
            id="theme-toggle"
            hidden
            checked={isDark}
            onChange={() => setIsDark(prev => !prev)}
          />
          <label htmlFor="theme-toggle" className="theme-toggle"></label>

          <a href="#" className="notif">
            {/* <i className='bx bx-bell'></i>
            <span className="count">12</span> */}
            <NotificationPanel />
          </a>
          <a href="#" className="profile">
            {/* <img src="/images/logo.png" alt="Profile" /> */}
            <img src={profileImage} alt="Profile" />
          </a>
        </nav>

        <main style={{ padding: '1.5rem' }}>
          {activeTab === 'home' && (
            <>
              <div className="header">
                <div className="left">
                  <h1>{getGreeting(userName)}</h1>  
                </div>
              </div>

              <div className='home-container'>
              <CalendarView tasks={tasks} setTasks={setTasks} onBack={() => {}} />

              <div className="home-side-panel">

                {/* Pending Tasks */}
                <div className="orders">
                  <div className="header">
                    <i className='bx bx-receipt'></i>
                    <h3>Pending Tasks</h3>
                    <i className='bx bx-filter'></i>
                  </div>
                  <div className='scroll-container'>
                    <table>
                      <thead>
                        <tr><th>Task Title</th><th>Due Date</th><th>Status</th></tr>
                      </thead>
                      <tbody id='pending-tasks-table'>
                        {tasks.filter(task => task.status !== "Completed").length === 0 ? (
                            <tr>
                              <td colSpan="3" style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}>
                                No pending tasks
                              </td>
                            </tr>
                          ) : (
                            tasks
                              .filter(task => task.status !== "Completed")
                              .map((task) => (
                                <tr key={task.id}>
                                  <td>{task.title}</td>
                                  <td>{task.dueDate}</td>
                                  <td>
                                    <span className={`status ${task.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                      {task.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="reminders">
                  <div className="header">
                    <i className='bx bx-note'></i>
                    <h3>Recent Activity</h3>
                    <i className='bx bx-filter'></i>
                  </div>
                  <div className='scroll-container'>
                    <ul className="task-list">
                      {recentActivities.length === 0 ? (
                        <li className="not-completed">
                          <div className="task-title">
                            <i className='bx bx-info-circle'></i>
                            <p style={{ fontStyle: 'italic', color: '#999' }}>No recent activity</p>
                          </div>
                        </li>
                      ) : (
                        recentActivities.map((activity, index) => (
                          <li key={index} className={activity.action === 'Completed' ? 'completed' : 'not-completed'}>
                            <div className="task-title">
                              <i className={`bx ${activity.action === 'Completed' ? 'bx-check-circle' : 'bx-pencil'}`}></i>
                              <p>{`${activity.action} ${activity.type}: ${activity.title}`}</p>
                            </div>
                            <span style={{ fontSize: '12px', color: '#777', marginLeft: '32px' }}>{formatTimestamp(activity.timestamp)}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              </div>
              {/*
              <ul className="insights">
                <li>
                  <CalendarView tasks={tasks} setTasks={setTasks} onBack={() => {}} />
                  <li>
                    <i className='bx bx-show-alt'></i>
                    <span className="info">
                      <h3>Insights</h3>
                      <p>----</p>
                    </span>
                  </li>
                  <li>
                    <i className='bx bx-line-chart'></i>
                    <span className="info">
                      <h3>Statistics</h3>
                      <p>----</p>
                    </span>
                  </li>
                  <li>
                    <i className='bx bx-dollar-circle'></i>
                    <span className="info">
                      <h3>Revenue</h3>
                      <p>----</p>
                    </span>
                  </li>
                </li>
              </ul>
              
              <div className="bottom-data">
                <Orders />
                <Reminders />
              </div>
              */}

            </>
          )}

          {activeTab === 'notes' && (
            <div className="notes-tab-wrapper">
               <NotesTab 
                 notes={notes} 
                 setNotes={setNotes} 
                 chatContext={chatContext}
                 setChatContext={setChatContext}
               />
            </div>
          )}
          {activeTab === 'todo' && (
              <div className="todo-tab-wrapper">
                <TodoDashboard reloadTaskList={() => fetchTasks(auth.currentUser)} />
              </div>
          )}
          {activeTab === 'pdf' && (
              <div className="pdf-tab-wrapper">
                <PdfTab 
                  onSaveNote={(newNote) => setNotes(prev => [newNote, ...prev])}
                  chatContext={chatContext}
                  setChatContext={setChatContext}
                />
              </div>
            )}
          {activeTab === 'quiz' && (
            <div className="quiz-tab-wrapper">
              <QuizMakerTab notes={notes} />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="settings-tab-wrapper">
              <Settings onPhotoUpdate={setProfileImage}/>
            </div>
          )}
        </main>
      </div>
      <ChatbotWidget 
        contextNote={chatContext} 
        onClearContext={() => setChatContext(null)}
      />
    </div>
  );
};
function getTimeofDay(){
  const hours = new Date().getHours();
  if (hours < 12) return 'Morning';
  if (hours < 18) return 'Afternoon';
  return 'Evening';
}
function getGreeting(name) {
  const timeOfDay = getTimeofDay();
  const greeting = `Good ${timeOfDay}, ${name}`;
  return greeting;
}
function formatTimestamp(timestamp) {
  if (!timestamp) return '';

  const dateObj = timestamp.seconds
    ? new Date(timestamp.seconds * 1000) 
    : new Date(timestamp);               

  return dateObj.toLocaleDateString(); 
}
const Orders = () => (
  <div className="orders">
    <div className="header">
      <i className='bx bx-receipt'></i>
      <h3>Unfinished Task</h3>
      <i className='bx bx-filter'></i>
    </div>
    <table>
      <thead>
        <tr><th>Task</th><th>Date</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><img src="/images/profile-1.jpg" alt="Profile" /><p>LEMORT</p></td>
          <td>DATE HERE</td>
          <td><span className="status completed">Completed</span></td>
        </tr>
        <tr>
          <td><img src="/images/profile-1.jpg" alt="Profile" /><p>LEMORT</p></td>
          <td>DATE MAYBE</td>
          <td><span className="status pending">Pending</span></td>
        </tr>
        <tr>
          <td><img src="/images/profile-1.jpg" alt="Profile" /><p>LEMORT</p></td>
          <td>DATE AGAIN</td>
          <td><span className="status process">Processing</span></td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default Dashboard;
