// CalendarView.jsx
import React, { useEffect } from 'react';
import '../styles/CalendarView.css';

const CalendarView = ({ tasks, setTasks, onBack }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

  useEffect(() => {
    generateCalendarGrid();
    loadCalendarTasks();
  }, [currentMonth, currentYear, tasks]);

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

  const handleDrop = (e, date) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const today = new Date().toISOString().split('T')[0];
    if (date < today) return alert("Can't set task to past date.");

    const updatedTasks = tasks.map(t => t.id === parseInt(id) ? { ...t, dueDate: date } : t);
    setTasks(updatedTasks);
  };

  const generateCalendarGrid = () => {
    const container = document.getElementById('calendar-scheduled');
    if (!container) return;
    container.innerHTML = '';

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      const div = document.createElement('div');
      div.className = 'calendar-day';
      div.dataset.date = dateStr;
      div.innerHTML = `
        <div class='day-label'>${date.toDateString()}</div>
        <div class='drop-zone' ondragover='event.preventDefault()' ondrop=''> </div>
      `;
      container.appendChild(div);
    }
  };

  const loadCalendarTasks = () => {
    const unscheduled = document.getElementById('unscheduled-tasks');
    const container = document.getElementById('calendar-scheduled');
    if (!unscheduled || !container) return;
    unscheduled.innerHTML = '';

    tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'calendar-task';
      div.draggable = true;
      div.ondragstart = (e) => dragStart(e, task.id);
      div.innerHTML = `<strong>${task.title}</strong><small>${task.dueDate || 'No due date'}</small>`;

      if (!task.dueDate || task.dueDate === 'None') {
        unscheduled.appendChild(div);
      } else {
        const target = container.querySelector(`[data-date='${task.dueDate}'] .drop-zone`);
        if (target) target.appendChild(div);
      }
    });
  };

  return (
    <div id="calendar-view">
      <div className="header">
        <h2>📅 Calendar View</h2>
        <button onClick={onBack}>🔙 Back to To-Do</button>
      </div>

      <div className="calendar-layout">
        <div className="no-due-date-tasks">
          <h3>Tasks Without Due Dates</h3>
          <div id="unscheduled-tasks"></div>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <h3>Scheduled Tasks</h3>
            <div className="month-nav">
              <button onClick={prevMonth}>◀</button>
              <span>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={nextMonth}>▶</button>
            </div>
          </div>
          <div id="calendar-scheduled" className="calendar-grid"></div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
