import React, { useState, useEffect } from 'react';
import NotesTab from '../components/NotesTab.js';
import TodoDashboard from '../components/TodoDashboard.js';
import PdfTab from '../components/PdfTab.js';
import QuizMakerTab from '../components/QuizMakerTab.js';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false); // auto-close sidebar on mobile
    }
  };

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
              <i className='bx bx-file'></i>PDF Tools
            </a>
          </li>
          <li className={activeTab === 'quiz' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('quiz'); }}>
              <i className='bx bx-edit'></i>Quiz Maker
            </a>
          </li>

          <li className={activeTab === 'settings' ? 'active' : ''}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('settings'); }}>
              <i className='bx bx-cog'></i>Settings
            </a>
          </li>
        </ul>
        <ul className="side-menu">
          <li>
            <a href="#" className="logout">
              <i className='bx bx-log-out-circle'></i>Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        <nav>
          <i className='bx bx-menu' onClick={() => setSidebarOpen(prev => !prev)}></i>
          <form>
            <div className="form-input">
              <input type="search" placeholder="Search..." />
              <button className="search-btn" type="submit"><i className='bx bx-search'></i></button>
            </div>
          </form>

          <input
            type="checkbox"
            id="theme-toggle"
            hidden
            checked={isDark}
            onChange={() => setIsDark(prev => !prev)}
          />
          <label htmlFor="theme-toggle" className="theme-toggle"></label>

          <a href="#" className="notif">
            <i className='bx bx-bell'></i>
            <span className="count">12</span>
          </a>
          <a href="#" className="profile">
            <img src="/images/logo.png" alt="Profile" />
          </a>
        </nav>

        <main style={{ padding: '1.5rem' }}>
          {activeTab === 'home' && (
            <>
              <div className="header">
                <div className="left">
                  <h1>Dashboard</h1>
                  <ul className="breadcrumb">
                    <li><a href="#">Home</a></li>
                    <li>/</li>
                    <li><a href="#" className="active">Home</a></li>
                  </ul>
                </div>
                <a href="#" className="report">
                  <i className='bx bx-cloud-download'></i>
                  <span>Report</span>
                </a>
              </div>

              <ul className="insights">
                <li><i className='bx bx-calendar-check'></i><span className="info"><h3>Calendar</h3><p>------</p></span></li>
                <li><i className='bx bx-show-alt'></i><span className="info"><h3>Insights</h3><p>----</p></span></li>
                <li><i className='bx bx-line-chart'></i><span className="info"><h3>Statistics</h3><p>----</p></span></li>
                <li><i className='bx bx-dollar-circle'></i><span className="info"><h3>Revenue</h3><p>----</p></span></li>
              </ul>

              <div className="bottom-data">
                <Orders />
                <Reminders />
              </div>
            </>
          )}

          {activeTab === 'notes' && (
            <div className="notes-tab-wrapper">
               <NotesTab notes={notes} setNotes={setNotes} />
            </div>
          )}
          {activeTab === 'todo' && (
              <div className="todo-tab-wrapper">
                <TodoDashboard />
              </div>
          )}
          {activeTab === 'pdf' && (
              <div className="pdf-tab-wrapper">
                <PdfTab onSaveNote={(newNote) => setNotes(prev => [newNote, ...prev])} />
              </div>
            )}
          {activeTab === 'quiz' && (
              <div className="quiz-tab-wrapper">
                <QuizMakerTab />
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Orders = () => (
  <div className="orders">
    <div className="header">
      <i className='bx bx-receipt'></i>
      <h3>Recent Orders</h3>
      <i className='bx bx-filter'></i>
      <i className='bx bx-search'></i>
    </div>
    <table>
      <thead>
        <tr><th>User</th><th>Date</th><th>Status</th></tr>
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

const Reminders = () => (
  <div className="reminders">
    <div className="header">
      <i className='bx bx-note'></i>
      <h3>Reminders</h3>
      <i className='bx bx-filter'></i>
      <i className='bx bx-plus'></i>
    </div>
    <ul className="task-list">
      <li className="completed"><div className="task-title"><i className='bx bx-check-circle'></i><p>WHEN MANI MAHUMAN</p></div><i className='bx bx-dots-vertical-rounded'></i></li>
      <li className="completed"><div className="task-title"><i className='bx bx-check-circle'></i><p>I HAVE NO IDEA</p></div><i className='bx bx-dots-vertical-rounded'></i></li>
      <li className="not-completed"><div className="task-title"><i className='bx bx-x-circle'></i><p>PAPASA NALANG MI KING JULIEN</p></div><i className='bx bx-dots-vertical-rounded'></i></li>
    </ul>
  </div>
);

export default Dashboard;
