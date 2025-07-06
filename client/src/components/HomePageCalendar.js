import React, { useEffect } from 'react';
import { auth, db, doc, updateDoc } from '../firestore-database/firebase';
import '../styles/HomePageCalendarView.css';
// add mobile
const CalendarView = ({ tasks, setTasks, onBack }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 576);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 576);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    generateCalendarGrid();
    loadCalendarTasks();
  }, [currentMonth, currentYear, tasks, isMobile]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  const dragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const today = new Date().toLocaleDateString('en-CA');

    if (date < today) return alert("Can't set task to a past date.");

    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, dueDate: date };

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated.");
      const userName = user.displayName || user.uid;
      const taskRef = doc(db, 'Mort-Task', userName, 'Task', taskId);

      await updateDoc(taskRef, { dueDate: date });

      const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to update due date:", error);
      alert("Error updating due date.");
    }
  };

  const generateCalendarGrid = () => {
    const container = document.getElementById('calendar-scheduled');
    if (!container) return;
    container.innerHTML = '';

    // Create weekday headers and day cells as siblings in the same grid
    const weekdays = isMobile
      ? ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-weekday' + (isMobile ? ' mobile' : '');
      dayHeader.textContent = day;
      container.appendChild(dayHeader);
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const todayStr = new Date().toLocaleDateString('en-CA');

    // Start from the correct weekday index
    const startIndex = firstDay.getDay();
    const totalDays = lastDay.getDate();

    // Add blank cells before the first day
    for (let i = 0; i < startIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      container.appendChild(emptyCell);
    }

    // Create cells for each day
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toLocaleDateString('en-CA');

      const dayDiv = document.createElement('div');
      dayDiv.className = 'calendar-day';
      dayDiv.dataset.date = dateStr;

      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = day; // Just the number

      // Add a blue dot if there is a task for this day
      const hasTask = tasks.some(task => task.dueDate === dateStr && task.status !== 'Completed');
      if (hasTask) {
        const dot = document.createElement('div');
        dot.className = 'calendar-dot';
        label.appendChild(dot);
      }

      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone';

      if (dateStr < todayStr) {
        dropZone.classList.add('disabled-drop');
      } else {
        dropZone.ondragover = allowDrop;
        dropZone.ondrop = (e) => handleDrop(e, dateStr);
      }

      dayDiv.appendChild(label);
      dayDiv.appendChild(dropZone);
      container.appendChild(dayDiv);
    }
  };

  const loadCalendarTasks = () => {
    const container = document.getElementById('calendar-scheduled');

    tasks.forEach(task => {
      if (task.status === "Completed") return; // Skip completed tasks

      const div = document.createElement('div');
      div.className = 'calendar-task';
      div.draggable = true;
      div.ondragstart = (e) => dragStart(e, task.id);
      div.innerHTML = `<strong>${task.title}</strong>`;

      const target = container.querySelector(`[data-date='${task.dueDate}'] .drop-zone`);
      if (target) target.appendChild(div);
    });
  };

  return (
   <div id="home-calendar-view" className='home-calendar-view'>

      <div className="calendar-layout">

        <div className="calendar-container">
          <div className="calendar-header">
            <h3 className='calendar-label'>Calendar</h3>
            <div className="month-nav">
              <span>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
              <button className='calendar-buttons' onClick={prevMonth}>◀</button>
              <button className='calendar-buttons' onClick={nextMonth}>▶</button>
              
            </div>
          </div>
          <div id="calendar-scheduled" className="calendar-grid"></div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;