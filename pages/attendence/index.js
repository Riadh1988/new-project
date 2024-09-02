import React, { useState, useEffect,useMemo, useCallback } from 'react';
import Modal from '@/components/Modal'; // Adjust the import path if necessary
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSunday,startOfMonth, endOfMonth, endOfWeek } from 'date-fns'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '@/components/Layout';
import axios from 'axios';
import Loader from '@/components/Loader';

 

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

const AttendancePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [status, setStatus] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [attendance, setAttendance] = useState({}); 
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedAgentInfo, setSelectedAgentInfo] = useState(null);
  const [agentReport, setAgentReport] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [groupDate, setGroupDate] = useState({ from: new Date(), to: new Date() });
  const [start, setStart] = useState({ from: new Date(), to: new Date() });
  const [end, setEnd] = useState({ from: new Date(), to: new Date() });
  const [Loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);   
  const [clients, setClients] = useState([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentClient, setNewAgentClient] = useState('');
  const [newAgentWfh, setNewAgentWfh] = useState(false);
  const [newAgentPosition, setNewAgentPosition] = useState('');
  const [modalnew, setModalnew] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [extraHours, setExtraHours] = useState(0);
  const weekDays = useMemo(() => getFormattedWeekDays(currentWeekStart), [currentWeekStart]);


  const fetchAttendance = useCallback(async (weekStart) => {
    try {
      if (!weekStart || isNaN(new Date(weekStart).getTime())) {
        console.error('Invalid weekStart:', weekStart);
        return;
      }
      setLoading(true);
      const { data } = await axios.get(`/api/attendance/w/${weekStart.toISOString()}`);
      const attendanceData = data.reduce((acc, record) => {
        if (!acc[record.agentId._id]) {
          acc[record.agentId._id] = [];
        }
        acc[record.agentId._id].push({
          date: format(new Date(record.date), 'yyyy-MM-dd'),
          status: record.status,
          extraHours: record.extraHours,
        });
        return acc;
      }, {});
      setAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  
  useEffect(() => {
    if (currentWeekStart && !isNaN(new Date(currentWeekStart).getTime())) {
      fetchAttendance(currentWeekStart);
    } else {
      console.error('Invalid currentWeekStart:', currentWeekStart);
    }
  }, [currentWeekStart, fetchAttendance]);

 const fetchAgentsAndClients = useCallback(async () => {
  try {
    const [agentsResponse, clientsResponse] = await Promise.all([
      fetch('/api/attendance').then((res) => res.json()),
      axios.get('/api/clients')
    ]);
    setAgents(Array.isArray(agentsResponse.data) ? agentsResponse.data : []);
    setClients(clientsResponse.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}, []);

useEffect(() => {
  fetchAgentsAndClients();
}, [fetchAgentsAndClients]);
  
  
  
  

const createAgent = useCallback(async () => {
  setLoading(true);
  try {
    const agentData = {
      name: newAgentName,
      position: newAgentPosition,
      client: newAgentClient,
      wfh: newAgentWfh,
    };
    await axios.post('/api/attendance', agentData);
    fetchAgentsAndClients();
    setModalNew(false);
    setNewAgentWfh(false);
    setNewAgentClient('');
    setNewAgentPosition('');
    setNewAgentName('');
  } catch (error) {
    console.error('Error creating agent:', error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
}, [newAgentName, newAgentPosition, newAgentClient, newAgentWfh, fetchAgentsAndClients]);

  
  const filterPreviousMonths = (date) => {
    const today = new Date();
    return date < new Date(today.getFullYear(), today.getMonth(), 1);
  };
   

  const handleCellClick = (agent, dayIndex, currentStatus, extraHours) => {
    setSelectedCells([{ agent, dayIndex }]);
    setSelectedAgent(agent);
    setStatus(currentStatus);
    setShowModal(true);
    setExtraHours(extraHours);
  };
  

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleAgentNameClick = (agent) => { 
    const report = getMonthlyReport(agent._id);
    setAgentReport(report);
    setSelectedAgentInfo(agent);
    setShowAgentModal(true); 
  };

  const handleMonthSelect = async (date) => {
    const startOfSelectedMonth = startOfMonth(date);
    const endOfSelectedMonth = endOfMonth(date);
    
    setStart(format(startOfSelectedMonth, 'yyyy-MM-dd'));
    setEnd(format(endOfSelectedMonth, 'yyyy-MM-dd'));
    setShowDatePicker(false);     
   setLoading(true);
  
   try {
     const response = await axios.get('/api/attendance/submit', {
       params: {
         agentId: selectedAgentInfo._id,
         startDate: startOfSelectedMonth,
         endDate: endOfSelectedMonth,
       },
     });
   
     const agentAttendance = response.data;
       
  
      const report = {
        presentInOffice: 0,
        workingFromHome: 0,
        absent: 0,
        sickLeave: 0,
        vacation: 0,
        dayoff: 0, 
        workHoliday: 0,
        workingHours: 0,
        workingsunday: 0,
      };
  
      agentAttendance.forEach(entry => {
        const entryDate = new Date(entry.date);
        const isSunday = entryDate.getDay() === 0; // Sunday
  
        switch (entry.status) {
          case 'present-of':
            report.presentInOffice += 1;
            report.workingHours += 8;
            if (isSunday) {
              report.workingsunday += 1;
            }
            break;
          case 'present-wfh':
            report.workingFromHome += 1;
            report.workingHours += 8;
            if (isSunday) {
              report.workingsunday += 1;
            }
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
          case 'day-off':
            report.dayoff += 1;
            // Only increment workingHours for day-off if it's Sunday (already accounted in 'workingsunday')
            break;
          case 'work-holiday':
            report.workHoliday += 1;
            report.workingHours += 8;
            if (isSunday) {
              report.workingsunday += 1;
            }
            break;
          default:
            break;
        }
      });
  
      setAgentReport(report);
  
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false); 
      fetchData()
    }
  };
  const getMonthlyReport = async (agentId) => {
    const currentMonthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const currentMonthEnd = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');
    
    setStart(currentMonthStart);
    setEnd(currentMonthEnd); 
    setLoading(true);
  
    try {
      const response = await axios.get('/api/attendance/submit', {
        params: {
          agentId,
          startDate: currentMonthStart,
          endDate: currentMonthEnd,
        },
      });
  
      const agentAttendance = response.data;
  
      const report = {
        presentInOffice: 0,
        workingFromHome: 0,
        extraHours: 0, 
        absent: 0,
        sickLeave: 0,
        vacation: 0,
        dayoff: 0, 
        workHoliday: 0,
        workingHours: 0,
        workingsunday: 0,
      };
  
      agentAttendance.forEach(entry => {
        const entryDate = new Date(entry.date);
        const isSunday = entryDate.getDay() === 0;
        report.extraHours += entry.extraHours || 0;
        switch (entry.status) {
          case 'present-of':
            report.presentInOffice += 1;
            report.workingHours += 8;
            if (isSunday) {
              report.workingsunday += 1;
            }
            break;
          case 'present-wfh':
            report.workingFromHome += 1;
            report.workingHours += 8;
            if (isSunday) {
              report.workingsunday += 1;
            }
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
          case 'day-off':
            report.dayoff += 1;
            break;
          case 'work-holiday':
            report.workHoliday += 1;
            report.workingHours += 8;
            if (isSunday) {
              report.workingsunday += 1;
            }
            break;
          default:
            break;
        }
      });
  
      setAgentReport(report);
  
    } catch (error) {
      console.error('Error fetching monthly report:', error);
    } finally {
      setLoading(false); 
      fetchAttendance()
    }
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    try {
      const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endOfWeekDate = endOfWeek(new Date(), { weekStartsOn: 1 });
  
      const currentWeekAttendance = attendance[selectedCells[0].agent._id]?.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfWeekDate && entryDate <= endOfWeekDate;
      }) || [];
  
      const totalExistingExtraHours = currentWeekAttendance.reduce((sum, entry) => sum + (entry.extraHours || 0), 0);
      const totalNewExtraHours = selectedCells.reduce((sum) => sum + (extraHours || 0), 0);
  
      if (totalExistingExtraHours + totalNewExtraHours > 8) {
        alert('Extra hours cannot exceed 8 hours per week.');
        return;
      }
  
      const attendanceData = selectedCells.map((cell) => ({
        agentId: cell.agent._id,
        date: weekDays[cell.dayIndex].date,
        status,
        client: cell.agent.client,
        extraHours,
      }));
  
      await axios.post('/api/attendance/submit', attendanceData);
      await fetchAttendance(currentWeekStart);
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting attendance:', error);
    } finally {
      setLoading(false);

    }
  }, [attendance, selectedCells, status, extraHours, weekDays]);

 

const handleGroupSubmit = async () => {
  setLoading(true);
  const { from, to } = groupDate; 

  // Ensure 'from' is not after 'to'
  if (from > to) {
    alert("The 'From' date cannot be after the 'To' date.");
    setLoading(false);
    return;
  }

  const startDate = from;
  const endDate = to;
  let currentDate = startDate;
  const attendanceData = [];

  while (currentDate <= endDate) {
    if (selectedAgents.length > 0) {
      selectedAgents.forEach(agent => {
        const isWeekend = [6, 0].includes(currentDate.getDay()); // 0: Sunday, 6: Saturday
        const statusToUse = isWeekend ? 'day-off' : status;
        attendanceData.push({
          agentId: agent._id,
          date: format(currentDate, 'yyyy-MM-dd'),
          status: statusToUse,
          client: agent.client,
        });
      });
    }
    currentDate = addDays(currentDate, 1);
  }

  try {
    // Send all attendance data in a single batch request
    await axios.post('/api/attendance/submit', attendanceData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Fetch updated attendance data
    await fetchAttendance(currentWeekStart);

    // Reset UI state
    setShowGroupModal(false);
    setSelectedAgents([]);
  } catch (error) {
    console.error('Error submitting group attendance:', error.response ? error.response.data : error.message);
    alert('Failed to submit attendance. Please try again later.');
  } finally {
    setLoading(false);
  }
};



const handlePreviousWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
const handleNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));  

const toggleAgentSelection = (agent) => {
  setSelectedAgents(prev =>
    prev.includes(agent)
      ? prev.filter(a => a._id !== agent._id)
      : [...prev, agent]
  );
};
const handleSelectAllAgents = () => {
  if (selectedAgents.length === filteredAgents.length) {
    // If all agents are selected, unselect all
    setSelectedAgents([]);
  } else {
    // Otherwise, select all filtered agents
    setSelectedAgents(filteredAgents);
  }
};

const handleRemoveAgent = (agentId) => {
  setSelectedAgents(prevSelectedAgents => prevSelectedAgents.filter(agent => agent._id !== agentId));
};

const filteredAgents = agents.filter(agent => {
  return (
    (agent.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedClient === '' || agent.client === selectedClient)
  );
}); 

const isCurrentWeek = (date) => {
  const startOfWeekDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const endOfWeekDate = endOfWeek(new Date(), { weekStartsOn: 1 });
  return date >= startOfWeekDate && date <= endOfWeekDate;
};
return (
  <Layout>
    <button onClick={() => setModalnew(true)}>Create new agent</button>
    <div className="filters">
      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
    <option value="">All Clients</option>
    {clients.map(client => (
      <option key={client._id} value={client._id}>
        {client.client}
      </option>
    ))}
  </select>
    </div>
    {selectedAgents.length > 0 && (
      <button onClick={() => setShowGroupModal(true)}>Edit Group</button>
    )}
    
    <div className="week-navigation">
    <span onClick={handlePreviousWeek}>Previous Week</span>
      <span>{format(currentWeekStart, 'MMM dd')} - {format(addDays(currentWeekStart, 6), 'MMM dd')}</span>
      <span onClick={handleNextWeek}>Next Week</span>
        </div>
    
   
    <table>
      <thead>
        <tr>
          <th>
          <input 
        type="checkbox" 
        onChange={handleSelectAllAgents} 
        checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0} 
      />
          </th>
          <th>Agent</th>
          {weekDays.map(({ dayName, formattedDate }) => (
            <th key={dayName}>{`${dayName} (${formattedDate})`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredAgents.map((agent) => (
          <tr key={agent._id}>
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

            {
            Loading ? <Loader /> :
            weekDays.map(({ date }, index) => {
              const entry = attendance[agent._id]?.find(entry => entry.date === date);
              const currentStatus = entry?.status || 'N/A';
              const extraHours = entry?.extraHours || 0; 
        
              return (
                <td
                  key={index}
                  style={{ backgroundColor: getStatusColor(currentStatus), cursor: 'pointer' }}
                  onClick={() => handleCellClick(agent, index, currentStatus,extraHours )}
                  className="cell-border"
                >
                  {getStatusText(currentStatus)} <br/>
                  {extraHours > 0 && <span>Extra Hours: {extraHours}</span>}
                </td>
              );
            })
             
            }
          </tr>
        ))}
      </tbody>
    </table>
    
    <Modal show={showAgentModal}  addition='addit-mod'>
      {
        Loading ? <Loader /> :
      
      selectedAgentInfo && (
        <Modal show={showAgentModal} onClose={() => setShowAgentModal(false)} addition='addit-mod'>
    {Loading ? (
      <Loader />
    ) : (
      selectedAgentInfo && agentReport && (
        <div className='topmodal'>
          <div>
              
            <p><strong>Name:</strong> {selectedAgentInfo.name}</p>
            <p><strong>Client:</strong> {clients.find(client => client._id === selectedAgentInfo.client)?.client}</p>
            <p><strong>Position:</strong> {selectedAgentInfo.position}</p>
            <h4>{selectedAgentInfo?.name}&apos;s Monthly Report from {start} To {end} 
            <span
                style={{ marginLeft: '10px', color: 'blue', cursor: 'pointer' }}
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                Edit
              </span>

            </h4>
            {showDatePicker && (
              <DatePicker
                selected={selectedMonth}
                onChange={(date) => handleMonthSelect(date)}
                showMonthYearPicker
                filterDate={filterPreviousMonths}
                dateFormat="MM/yyyy"
                inline
              />
            )}
             
            <table className=''>
  <thead>
    <tr>
      <th>Type</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody>
    {agentReport.presentInOffice > 0 && (
      <tr>
        <td>Present In Office</td>
        <td>{agentReport.presentInOffice} days / {agentReport.presentInOffice * 8} Hours</td>
      </tr>
    )}
    {agentReport.workingFromHome > 0 && (
      <tr>
        <td>Working From Home</td>
        <td>{agentReport.workingFromHome} days / {agentReport.workingFromHome * 8} Hours</td>
      </tr>
    )}
    {agentReport.extraHours > 0 && (
      <tr>
        <td>Extra Hours</td>
        <td>{agentReport.extraHours} Hours</td>
      </tr>
    )}
    {agentReport.workingsunday > 0 && (
      <tr>
        <td>Work on Sunday</td>
        <td>{agentReport.workingsunday} Days</td>
      </tr>
    )}
    {agentReport.workingHours > 0 && (
      <tr>
        <td>Total working hours</td>
        <td>{agentReport.workingHours} Hours</td>
      </tr>
    )}
    {agentReport.absent > 0 && (
      <tr>
        <td>Absent</td>
        <td>{agentReport.absent} days</td>
      </tr>
    )}
    {agentReport.sickLeave > 0 && (
      <tr>
        <td>Sick Leave</td>
        <td>{agentReport.sickLeave} days</td>
      </tr>
    )}
    {agentReport.vacation > 0 && (
      <tr>
        <td>Vacation</td>
        <td>{agentReport.vacation} days</td>
      </tr>
    )}
    {agentReport.holiday > 0 && (
      <tr>
        <td>Holiday</td>
        <td>{agentReport.holiday} days</td>
      </tr>
    )}
    {agentReport.workHoliday > 0 && (
      <tr>
        <td>Work on Holiday</td>
        <td>{agentReport.workHoliday} days</td>
      </tr>
    )}
  </tbody>
</table>


          </div>
          <div className='bottom-modal'> 
            <button className='CLOSE red' onClick={() => setShowAgentModal(false)}>Close</button>
          </div>

          
        </div>
      )
    )}
  </Modal>
      )}
    </Modal>


    <Modal show={showModal} onClose={() => setShowModal(false)} addition='addit-mod'>
        
       { Loading ? <Loader /> :
         <div className='topmodal'>
        <div>
                <h2>{selectedAgent?.name}&apos;s Attendance on {selectedCells.map(cell => weekDays[cell.dayIndex].dayName).join(', ')}</h2>
                <label>
                    Change :
                    <select value={status} onChange={handleStatusChange}>
                        <option value="">Select a Status</option>
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

                 
                {isCurrentWeek(new Date(weekDays[selectedCells[0]?.dayIndex]?.date)) && (
            <div>
              <label>Extra Hours:</label>
              <input
                type="number"
                value={extraHours}
                onChange={(e) => setExtraHours(parseInt(e.target.value, 10))}
                max="4"
                min="0"
                className='number-input'
              />
            </div>
          )}
                     
            </div>

            <div className='bottom-modal'>
                <button onClick={handleSubmit}>Submit</button>
                <button className='CLOSE red' onClick={() => setShowModal(false)}>Close</button>
            </div>
         </div>
      }
            
        
    </Modal>

    <Modal show={showGroupModal} onClose={() => setShowGroupModal(false)} addition='addit-mod'>
      {
        Loading ? <Loader /> : 
        <div className='topmodal'>
        <div>
          <h2>Edit Group Attendance</h2>
          <div className='modal-group'>
            {selectedAgents.map((agent) => (
              <span key={agent._id} onClick={() => handleRemoveAgent(agent._id)}>
                {agent.name}
              </span>
            ))}
          </div>
          <div className='fromto'>
            <div className='l'>
              <label>
                From:
                <DatePicker selected={groupDate.from} onChange={(date) => setGroupDate(prev => ({ ...prev, from: date }))} />
              </label>
            </div>
            <div className='r'>
              <label>
                To:
                <DatePicker selected={groupDate.to} onChange={(date) => setGroupDate(prev => ({ ...prev, to: date }))} />
              </label>
            </div>
          </div>
          <div>
            <label>
              Change Status for Selected Agents:
              <select value={status} onChange={handleStatusChange}>
              <option value="" disabled>  Select a Status  </option>
                <option value="present-of">Present In Office</option>
                <option value="present-wfh">Present From Home</option>
                <option value="absent">Absent</option>
                <option value="sickleave">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="holiday">Holiday</option>
                <option value="day-off">Day Off</option>
                <option value="work-holiday">Work on Holiday</option>
              </select>
            </label>
          </div>
        </div>
        
        <div className='bottom-modal'>
            <button onClick={handleGroupSubmit}>Apply Changes</button>
            <button className='CLOSE red' onClick={() => setShowGroupModal(false)}>Close</button>
            </div>
      </div>
      }
      
    </Modal>

    <Modal show={modalnew} onClose={() => setModalnew(false)} addition='addit-mod'>
     
      {
        Loading ? <Loader /> : 
      <div className="topmodal"> 
        <div>
        <h3>Add New Agent</h3>
        <input
          type="text"
          placeholder="Agent Name"
          value={newAgentName}
          onChange={(e) => setNewAgentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Agent Position"
          value={newAgentPosition}
          onChange={(e) => setNewAgentPosition(e.target.value)}
        />
        <label>
          Client:
          <select
            value={newAgentClient}
            onChange={(e) => setNewAgentClient(e.target.value)}
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.client}</option>
            ))}
          </select>
        </label>
        <label>
          The agent will work from home or office
          
          <input
            type="checkbox"
            checked={newAgentWfh}
            onChange={(e) => setNewAgentWfh(e.target.checked)}
          />
        </label>
        
        </div>
        <div className='bottom-modal'>
          <button onClick={createAgent}>Add Agent</button>
          <button className='CLOSE red' onClick={() => setModalnew(false)}>Close</button>
        </div>
      </div>
      }
      
       
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
      return '  -------  ';
  }
};


export default AttendancePage;