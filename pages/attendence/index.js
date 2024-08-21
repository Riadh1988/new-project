import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal'; // Adjust the import path if necessary
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '@/components/Layout';

const initialAgents = [
  { id: 1, name: 'Agent 1' },
  { id: 2, name: 'Agent 2' },
  { id: 3, name: 'Agent 3' },
  { id: 4, name: 'Agent 4' },
  { id: 5, name: 'Agent 5' },
];

const generateWeekDays = (startDate) => {
  return Array.from({ length: 7 }, (_, index) => addDays(startDate, index));
};

const getFormattedWeekDays = (startDate) => {
  const weekDays = generateWeekDays(startDate);
  return weekDays.map(date => ({
    dayName: format(date, 'EEEE'),
    date: format(date, 'yyyy-MM-dd'),
    formattedDate: format(date, 'dd-MM-yyyy'),
  }));
};

const initializeAttendance = (agents, startDate) => {
  const attendance = {};
  for (const agent of agents) {
    attendance[agent.id] = [];
    for (let i = -21; i <= 21; i++) { // 3 previous weeks (-21 days) to 3 future weeks (+21 days)
      const currentDate = addDays(startDate, i);
      const dayName = format(currentDate, 'EEEE');
      attendance[agent.id].push({
        date: format(currentDate, 'yyyy-MM-dd'),
        status: dayName === 'Saturday' || dayName === 'Sunday' ? 'weekend' : 'present-of',
      });
    }
  }
  return attendance;
};

const AttendancePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [status, setStatus] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [attendance, setAttendance] = useState({});
  const [groupDate, setGroupDate] = useState(new Date());

  useEffect(() => {
    setAttendance(initializeAttendance(initialAgents, currentWeekStart));
  }, [currentWeekStart]);

  const weekDays = getFormattedWeekDays(currentWeekStart);

  const handleCellClick = (agent, dayIndex, currentStatus) => {
    setSelectedCells([{ agent, dayIndex }]);
    setSelectedAgent(agent);
    setStatus(currentStatus);
    setShowModal(true);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleSubmit = () => {
    const updatedAttendance = { ...attendance };
    selectedCells.forEach(cell => {
      const date = weekDays[cell.dayIndex].date;
      updatedAttendance[cell.agent.id] = updatedAttendance[cell.agent.id].map(entry =>
        entry.date === date ? { ...entry, status } : entry
      );
    });
    setAttendance(updatedAttendance);
    setShowModal(false);
  };

  const handleGroupSubmit = () => {
    const updatedAttendance = { ...attendance };
    selectedAgents.forEach(agent => {
      updatedAttendance[agent.id] = updatedAttendance[agent.id].map(entry =>
        entry.date === format(groupDate, 'yyyy-MM-dd') ? { ...entry, status } : entry
      );
    });
    setAttendance(updatedAttendance);
    setShowGroupModal(false);
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const canShowPreviousWeek = subWeeks(currentWeekStart, 1) >= startOfWeek(subWeeks(new Date(), 3), { weekStartsOn: 1 });
  const canShowNextWeek = addWeeks(currentWeekStart, 1) <= startOfWeek(addWeeks(new Date(), 3), { weekStartsOn: 1 });

  const toggleAgentSelection = (agent) => {
    setSelectedAgents(prev => 
      prev.includes(agent)
        ? prev.filter(a => a.id !== agent.id)
        : [...prev, agent]
    );
  };
  const handleRemoveAgent = (agentId) => {
    setSelectedAgents(prevSelectedAgents => prevSelectedAgents.filter(agent => agent.id !== agentId));
  };
  
  return (

    <Layout>
      <h1>Weekly Attendance</h1>
      <div className="week-navigation">
        <span onClick={handlePreviousWeek} disabled={!canShowPreviousWeek}>Previous Week</span>
        <span onClick={handleNextWeek} disabled={!canShowNextWeek}>Next Week</span>
      </div>
      {selectedAgents.length > 0 && (
        <button onClick={() => setShowGroupModal(true)}>Edit Group</button>
      )}
      <table>
        <thead>
          <tr>
            <th>Select</th>
            <th>Agent</th>
            {weekDays.map(({ dayName, formattedDate }) => (
              <th key={dayName}>{`${dayName} (${formattedDate})`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {initialAgents.map((agent) => (
            <tr key={agent.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedAgents.includes(agent)}
                  onChange={() => toggleAgentSelection(agent)}
                />
              </td>
              <td>{agent.name}</td>
              {weekDays.map(({ date }, index) => {
                const currentStatus = attendance[agent.id]?.find(entry => entry.date === date)?.status || 'N/A';
                return (
                  <td
                    key={index}
                    style={{ backgroundColor: getStatusColor(currentStatus), cursor: 'pointer' }}
                    onClick={() => handleCellClick(agent, index, currentStatus)}
                  >
                    {currentStatus}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Individual Agent Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <h2>{selectedAgent?.name}'s Attendance on {selectedCells.map(cell => weekDays[cell.dayIndex].dayName).join(', ')}</h2>
        <label>
          Change Status:
          <select value={status} onChange={handleStatusChange}>
          <option value="present-of">Present OF</option>
        <option value="present-wfh">Present WFH</option>
        <option value="absent">Absent</option>
        <option value="sickleave">Sick Leave</option>
        <option value="weekend">Weekend</option>
        <option value="vacation">Vacation</option>
        <option value="holiday">Holiday</option>
        <option value="day-off">Day Off</option>
        <option value="work-holiday">Work on holiday</option>
          </select>
        </label>
        <button onClick={handleSubmit}>Submit</button>
      </Modal>

      {/* Group Edit Modal */}
      <Modal show={showGroupModal} onClose={() => setShowGroupModal(false)} addition='addit-mod'>
  <h2>Edit Group Attendance</h2>
  <div className='modal-group'>
    {selectedAgents.map((agent) => ( 
        <span key={agent.id} onClick={() => handleRemoveAgent(agent.id)}>{agent.name}</span>
        
       
    ))}
  </div>
  <div>
    <label>
      Select Date:
      <DatePicker selected={groupDate} onChange={(date) => setGroupDate(date)} />
    </label>
  </div>
  <div>
    <label>
      Change Status for Selected Agents:
      <select value={status} onChange={handleStatusChange}>
      <option value="present-of">Present OF</option>
        <option value="present-wfh">Present WFH</option>
        <option value="absent">Absent</option>
        <option value="sickleave">Sick Leave</option>
        <option value="weekend">Weekend</option>
        <option value="vacation">Vacation</option>
        <option value="holiday">Holiday</option>
        <option value="day-off">Day Off</option>
        <option value="work-holiday">Work on holiday</option>
      </select>
    </label>
  </div>
  <button onClick={handleGroupSubmit}>Apply to Group</button>
</Modal>


      <div id="modal-root"></div>
    </Layout>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'present-of':
      return '#4CAF50';  
    case 'present-wfh':
      return '#8BC34A';  
    case 'absent':
      return '#FFEB3B';  
    case 'sickleave':
      return '#FF9800';  
    case 'weekend':
      return '#F44336';  
    case 'vacation':
      return '#2196F3';  
    case 'holiday':
      return '#9C27B0';  
    case 'day-off':
      return '#FFC107';  
    case 'work-holiday':
      return '#FF5722';  
    default:
      return '#FFFFFF';  
  }
};


export default AttendancePage;
