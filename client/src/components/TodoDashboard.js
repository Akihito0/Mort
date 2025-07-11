import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView.js';

import '../styles/TodoDashboard.css';
import { auth, db, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from '../firestore-database/firebase';

const TodoDashboard = ({ reloadTaskList }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Not Started');
  const [priority, setPriority] = useState('Low');
  const [dueDate, setDueDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ priority: '', status: '', date: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);


  useEffect(() => {
  requestAnimationFrame(() => {
    updateProgress();
  });
  }, [tasks, showCalendar]);

  useEffect(() => {
  const fetchTasks = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userName = user.displayName || user.uid;
    const snapshot = await getDocs(collection(db, 'Mort-Task', userName, 'Task'));
    const fetchedTasks = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dueDate: data.dueDate || '',
        created: data.created || '',
      };
    });

    setTasks(fetchedTasks);
  };

  fetchTasks();
  }, []);

  const saveTask = async () => {
    if (!title || !description) return alert('Please fill out all required fields');
    
    const user = auth.currentUser;
    if (!user) return;
    const userName = user.displayName || user.uid;

    const taskData = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null, // already a string like '2025-06-29'
      created: new Date().toISOString(),
    };

    try {
      if (editId) {
        const docRef = doc(db, 'Mort-Task', userName, 'Task', editId);
        await updateDoc(docRef, taskData);
        setTasks(tasks.map(t => (t.id === editId ? { ...taskData, id: editId } : t)));
        setEditId(null);
      } else {
        const docRef = await addDoc(collection(db, 'Mort-Task', userName, 'Task'), taskData);
        setTasks([...tasks, { ...taskData, id: docRef.id }]);
        reloadTaskList && reloadTaskList();
      }

      // Clear form
      setTitle('');
      setDescription('');
      setStatus('Not Started');
      setPriority('Low');
      setDueDate('');
      setShowForm(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Check console for details.');
    }
  };


  const editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate || '');
    setEditId(id);
    setShowForm(true);
  };

  const deleteTask = async (id) => {
  const user = auth.currentUser;
  if (!user) return;

  const confirmDelete = window.confirm('Are you sure you want to delete this task?');
  if (!confirmDelete) return;

  const userName = user.displayName || user.uid;

  try {
    await deleteDoc(doc(db, 'Mort-Task', userName, 'Task', id));
    setTasks(tasks.filter(t => t.id !== id));
    reloadTaskList && reloadTaskList();
  } catch (error) {
    console.error('Failed to delete task:', error);
    alert('Failed to delete the task. Please try again later.');
  }
};

const markTaskAsDone = async (task) => {
  const user = auth.currentUser;
  if (!user || !task) return;
  const userName = user.displayName || user.uid;

  try {
    const docRef = doc(db, 'Mort-Task', userName, 'Task', task.id);
    await updateDoc(docRef, { ...task, status: 'Completed' });

    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, status: 'Completed' } : t))
    );
    setSelectedTask(null);
    reloadTaskList && reloadTaskList();
  } catch (err) {
    console.error('Failed to mark task as done:', err);
    alert('Something went wrong. Try again.');
  }
};

  const updateProgress = () => {
    const total = tasks.length || 1;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;

    setCircle('completed-bar', 'completed-count', (completed / total) * 100);
    setCircle('progress-bar', 'progress-count', (inProgress / total) * 100);
    setCircle('notstarted-bar', 'notstarted-count', (notStarted / total) * 100);
  };

  const setCircle = (barId, labelId, percent) => {
    const circle = document.getElementById(barId);
    const label = document.getElementById(labelId);
    if (!circle || !label) return;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
    label.textContent = `${Math.round(percent)}%`;
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (!filters.priority || task.priority === filters.priority) &&
      (!filters.status || task.status === filters.status) &&
      (!filters.date || task.dueDate === filters.date)
    );
  });

  const resetFilters = () => {
    setFilters({ priority: '', status: '', date: '' });
  };

  if (showCalendar) {
    return <CalendarView tasks={tasks} setTasks={setTasks} onBack={() => setShowCalendar(false)} />;
  }

  return (
  <>
    <div className="main-container">
      <div className="todo-app">
        <div className="header">
          <h2>To-Do</h2>
          <span>{new Date().toLocaleDateString()}</span>
          <div className="header-buttons">
            <button onClick={() => setShowForm(!showForm)}>+ Add Task</button>
            <button className="view-calendar-btn" onClick={() => setShowCalendar(true)}>📅 View Calendar</button>
          </div>
        </div>

        {showForm && (
          <div className="form">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Title  *" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description  *" />
            <input type="date" value={dueDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDueDate(e.target.value)} />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
               {editId && <option value="Completed">Completed</option>}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <button className="save-btn" onClick={saveTask}>Save Task</button>
          </div>
        )}

        <div className="filter-section">
          <h4>Filter Tasks</h4>
          <div className="filters">
            <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
            </select>
            <input type="date" value={filters.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            <button onClick={resetFilters}>Reset Filters</button>
          </div>
        </div>

        <div id="todo-tasks">
          {filteredTasks
            .filter(task => task.status !== 'Completed')
            .map((task) => (
              <div
                key={task.id}
                className={`task-row ${task.status.replace(/\s+/g, '-').toLowerCase()} ${task.priority.toLowerCase()}-priority`}
                onClick={() => setSelectedTask(task)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="task-title">{task.title}</div>
                  <div className="task-date">Due: {task.dueDate || 'None'}</div>
                  <div className="badges">
                    <span className={`badge status-badge ${task.status.replace(/\s+/g, '-').toLowerCase()}`}>{task.status}</span>
                    <span className={`badge priority-badge ${task.priority.toLowerCase()}`}>{task.priority} Priority</span>
                  </div>
                </div>
                <div className="task-right">
                  <button onClick={(e) => { e.stopPropagation(); editTask(task.id); }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>🗑️</button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="right-panel">
        <div className="task-status">
          <h3>Task Status</h3>
          <div className="circular-bars">
            <div className="circle-container">
              <svg><circle cx="35" cy="35" r="30" className="bg" /><circle id="completed-bar" cx="35" cy="35" r="30" className="progress green" /></svg>
              <div className="label" id="completed-count">0%</div>
              <p>Completed</p>
            </div>
            <div className="circle-container">
              <svg><circle cx="35" cy="35" r="30" className="bg" /><circle id="progress-bar" cx="35" cy="35" r="30" className="progress blue" /></svg>
              <div className="label" id="progress-count">0%</div>
              <p>In Progress</p>
            </div>
            <div className="circle-container">
              <svg><circle cx="35" cy="35" r="30" className="bg" /><circle id="notstarted-bar" cx="35" cy="35" r="30" className="progress red" /></svg>
              <div className="label" id="notstarted-count">0%</div>
              <p>Not Started</p>
            </div>
          </div>
        </div>

        <div className="completed-tasks">
          <h3>Completed Tasks</h3>
          {tasks.filter(t => t.status === 'Completed').map(task => (
            <div key={task.id} className="task-row completed">
              <div>
                <div className="task-title">{task.title}</div>
                <div className="task-date">Due: {task.dueDate || 'None'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {selectedTask && (
      <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>{selectedTask.title}</h2>
          <p><strong>Description:</strong> {selectedTask.description}</p>
          <p><strong>Due Date:</strong> {selectedTask.dueDate || 'None'}</p>
          <p><strong>Status:</strong> {selectedTask.status}</p>
          <p><strong>Priority:</strong> {selectedTask.priority}</p>
          <button onClick={() => setSelectedTask(null)}>Close</button>
          {selectedTask.status !== 'Completed' && (
            <button onClick={() => markTaskAsDone(selectedTask)}>Mark as Done ✅</button>
          )}
        </div>
      </div>
    )}
  </>
);

};

export default TodoDashboard;
