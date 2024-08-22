import React, { useState, useEffect } from 'react';
import Modal from '@/components/Modal'; // Adjust the import path if necessary
import { format, addDays, startOfWeek, subWeeks, addWeeks } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '@/components/Layout';

const initialAgents = [
  { id: 1, name: 'Agent 1', client: 'Voyage Privée', wfh: true },
  { id: 2, name: 'Agent 2', client: 'Voyage Privée', wfh: false },
  { id: 3, name: 'Agent 3', client: 'Voyage Privée', wfh: true },
  { id: 4, name: 'Agent 4', client: 'Voyage Privée', wfh: false },
  { id: 5, name: 'Agent 5', client: 'Voyage Privée', wfh: true },
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
    for (let i = -21; i <= 21; i++) {
      const currentDate = addDays(startDate, i);
      const dayName = format(currentDate, 'EEEE');

      let defaultStatus;
      if (dayName === 'Saturday' || dayName === 'Sunday') {
        defaultStatus = 'day-off';
      } else {
        defaultStatus = agent.wfh ? 'present-wfh' : 'present-of';
      }

      attendance[agent.id].push({
        date: format(currentDate, 'yyyy-MM-dd'),
        status: defaultStatus,
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
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgentInfo, setSelectedAgentInfo] = useState(null);
  const [agentReport, setAgentReport] = useState({});
  
  // New state for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');

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

  const handleAgentNameClick = (agent) => {
    const report = getMonthlyReport(agent.id);
    setAgentReport(report);
    setSelectedAgentInfo(agent);
    setShowAgentModal(true);
  };

  const getMonthlyReport = (agentId) => {
    const currentMonthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');

    const agentAttendance = attendance[agentId];
    const report = {
      presentInOffice: 0,
      workingFromHome: 0,
      absent: 0,
      sickLeave: 0, 
      vacation: 0,
      holiday: 0,
      dayOff: 0,
      workHoliday: 0,
    };

    agentAttendance.forEach(entry => {
      if (entry.date >= currentMonthStart && entry.date <= today) {
        switch (entry.status) {
          case 'present-of':
            report.presentInOffice += 1;
            break;
          case 'present-wfh':
            report.workingFromHome += 1;
            break;
          case 'absent':
            report.absent += 1;
            break;
          case 'sickleave':
            report.sickLeave += 1;
            break;
          
          case 'vacation':
            report.vacation += 1;
            break;
          case 'holiday':
            report.holiday += 1;
            break;
          case 'day-off':
            report.dayOff += 1;
            break;
          case 'work-holiday':
            report.workHoliday += 1;
            break;
          default:
            break;
        }
      }
    });

    return report;
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

  // Filter agents based on search and client filter
  const filteredAgents = initialAgents.filter(agent => {
    return (
      (agent.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedClient === '' || agent.client === selectedClient)
    );
  });

  return (
    <Layout>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
          <option value="">All Clients</option>
          {Array.from(new Set(initialAgents.map(agent => agent.client))).map(client => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
      </div>
      
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
          {filteredAgents.map((agent) => (
            <tr key={agent.id}>
              <td className="cell-border">
                <input 
                  type="checkbox" 
                  checked={selectedAgents.includes(agent)}
                  onChange={() => toggleAgentSelection(agent)}
                />
              </td>
              <td className="cell-border" onClick={() => handleAgentNameClick(agent)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                {agent.name}
              </td>

              {weekDays.map(({ date }, index) => {
                const currentStatus = attendance[agent.id]?.find(entry => entry.date === date)?.status || 'N/A';
                return (
                  <td
                    key={index}
                    style={{ backgroundColor: getStatusColor(currentStatus), cursor: 'pointer' }}
                    onClick={() => handleCellClick(agent, index, currentStatus)}
                    className="cell-border"
                  >
                    {getStatusText(currentStatus)}<br /> {agent.client}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showAgentModal} onClose={() => setShowAgentModal(false)} addition='addit-mod'>
        {selectedAgentInfo && (
          <div className='topmodal'>
        <div>
            <p><strong>Name:</strong> {selectedAgentInfo.name}</p>
            <p><strong>Client:</strong> {selectedAgentInfo.client}</p>
            <p><strong>Work From Home:</strong> {selectedAgentInfo.wfh ? 'Yes' : 'No'}</p>
            <h2>{selectedAgentInfo?.name}'s Monthly Report</h2>
              <ul>
                <li>Present In Office: {agentReport.presentInOffice} days</li>
                <li>Working From Home: {agentReport.workingFromHome} days</li>
                <li>Absent: {agentReport.absent} days</li>
                <li>Sick Leave: {agentReport.sickLeave} days</li> 
                <li>Vacation: {agentReport.vacation} days</li>
                <li>Holiday: {agentReport.holiday} days</li>
                <li>Day Off: {agentReport.dayOff} days</li>
                <li>Work on Holiday: {agentReport.workHoliday} days</li>
              </ul>
              </div>
          </div>
        )}
      </Modal>


      <Modal show={showModal} onClose={() => setShowModal(false)} addition='addit-mod'>
        <div className='topmodal'>
        <div>
        <h2>{selectedAgent?.name}&apos;s Attendance on {selectedCells.map(cell => weekDays[cell.dayIndex].dayName).join(', ')}</h2>
        <label>
          Change Status:
          <select value={status} onChange={handleStatusChange}>
          <option value="present-of">Present In Office</option>
              <option value="present-wfh">Present From Home</option>
              <option value="absent">Absent</option>
              <option value="sickleave">Sick Leave</option> 
              <option value="vacation">Vacation</option>
              <option value="holiday">Holiday</option>
              <option value="day-off">Day Off</option>
              <option value="work-holiday">Work on holiday</option>
          </select>
        </label></div>
        <div className='topmodal-bottom'>
        <button onClick={handleSubmit}>Submit</button>
        </div></div>
      </Modal>
 
      <Modal show={showGroupModal} onClose={() => setShowGroupModal(false)} addition='addit-mod'>
      <div className='topmodal'>
      <div>
        <h2>Edit Group Attendance</h2>
        <div className='modal-group'>
          {selectedAgents.map((agent) => (
            <span key={agent.id} onClick={() => handleRemoveAgent(agent.id)}>
              {agent.name}
            </span>
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
              <option value="present-of">Present In Office</option>
              <option value="present-wfh">Present From Home</option>
              <option value="absent">Absent</option>
              <option value="sickleave">Sick Leave</option> 
              <option value="vacation">Vacation</option>
              <option value="holiday">Holiday</option>
              <option value="day-off">Day Off</option>
              <option value="work-holiday">Work on holiday</option>
            </select>
          </label>
        </div>
        </div>
        <div className='topmodal-bottom'>
        <button onClick={handleGroupSubmit}>Apply to Group</button>
        </div>
        </div>
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
    case 'vacation':
      return '#2196F3';  
    case 'holiday':
      return '#9C27B0';  
    case 'day-off':
      return 'red';  
    case 'work-holiday':
      return '#FF5722';  
    default:
      return '#FFFFFF';  
  }
};
const getStatusText = (status) => {
  switch (status) {
    case 'present-of':
      return 'Present In Office';
    case 'present-wfh':
      return 'Present From Home';
    case 'absent':
      return 'Absent';
    case 'sickleave':
      return 'Sick Leave'; 
    case 'vacation':
      return 'Vacation';
    case 'holiday':
      return 'Holiday';
    case 'day-off':
      return 'Day Off';
    case 'work-holiday':
      return 'Work on Holiday';
    default:
      return 'Unknown Status';
  }
};


export default AttendancePage;
