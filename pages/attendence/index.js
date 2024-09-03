import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '@/components/Modal';
import { format, addDays, startOfWeek, subWeeks, addWeeks, isSunday, startOfMonth, endOfMonth, endOfWeek } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '@/components/Layout';
import axios from 'axios';
import Loader from '@/components/Loader';

const generateWeekDays = (startDate) => Array.from({ length: 7 }, (_, index) => addDays(startDate, index));

const getFormattedWeekDays = (startDate) => generateWeekDays(startDate).map(date => ({
  dayName: format(date, 'EEEE'),
  date: format(date, 'yyyy-MM-dd'),
  formattedDate: format(date, 'dd-MM-yyyy'),
}));

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
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentClient, setNewAgentClient] = useState('');
  const [newAgentWfh, setNewAgentWfh] = useState(false);
  const [newAgentPosition, setNewAgentPosition] = useState('');
  const [modalNew, setModalNew] = useState(false);
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
        acc[record.agentId._id] = acc[record.agentId._id] || [];
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
    fetchAttendance(currentWeekStart);
  }, [currentWeekStart, fetchAttendance]);

  const fetchAgentsAndClients = useCallback(async () => {
    try {
      const [agentsResponse, clientsResponse] = await Promise.all([
        fetch('/api/attendance').then(res => res.json()),
        axios.get('/api/clients'),
      ]);
      setAgents(agentsResponse.data || []);
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

  const handleAgentNameClick = async (agent) => {
    setLoading(true);
    try {
      const report = await getMonthlyReport(agent._id);
      setAgentReport(report);
      setSelectedAgentInfo(agent);
      setShowAgentModal(true);
    } catch (error) {
      console.error('Error fetching agent report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthSelect = async (date) => {
    setShowDatePicker(false);
    setLoading(true);
    try {
      const startOfSelectedMonth = startOfMonth(date);
      const endOfSelectedMonth = endOfMonth(date);
      setStart(format(startOfSelectedMonth, 'yyyy-MM-dd'));
      setEnd(format(endOfSelectedMonth, 'yyyy-MM-dd'));
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
        const isSunday = entryDate.getDay() === 0;
        switch (entry.status) {
          case 'present-of':
            report.presentInOffice += 1;
            report.workingHours += 8;
            if (isSunday) report.workingsunday += 1;
            break;
          case 'present-wfh':
            report.workingFromHome += 1;
            report.workingHours += 8;
            if (isSunday) report.workingsunday += 1;
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
            if (isSunday) report.workingsunday += 1;
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
    }
  };

  const getMonthlyReport = async (agentId) => {
    const currentMonthStart = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    const currentMonthEnd = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');
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
        const extraHours = entry.extraHours || 0;
        switch (entry.status) {
          case 'present-of':
            report.presentInOffice += 1;
            report.workingHours += 8 + extraHours;
            if (isSunday) report.workingsunday += 1;
            break;
          case 'present-wfh':
            report.workingFromHome += 1;
            report.workingHours += 8 + extraHours;
            if (isSunday) report.workingsunday += 1;
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
            if (isSunday) report.workingsunday += 1;
            break;
          default:
            break;
        }
      });

      setLoading(false);
      return report;
    } catch (error) {
      setLoading(false);
      throw new Error(error.response?.data || error.message);
    }
  };

  const handleWeekChange = (direction) => {
    setCurrentWeekStart(prevWeek => direction === 'backward' ? subWeeks(prevWeek, 1) : addWeeks(prevWeek, 1));
  };

  const saveAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const data = selectedCells.map(({ agent, dayIndex }) => ({
        agentId: agent._id,
        date: weekDays[dayIndex].date,
        status,
        extraHours,
      }));
      await axios.post('/api/attendance/submit', data);
      fetchAttendance(currentWeekStart);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }, [selectedCells, status, extraHours, currentWeekStart, fetchAttendance, weekDays]);

  const filterAgentsByClient = useMemo(() => {
    if (!selectedClient) return agents;
    return agents.filter(agent => agent.client === selectedClient);
  }, [selectedClient, agents]);

  const filteredAgents = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return filterAgentsByClient.filter(agent => agent.name.toLowerCase().includes(lowercasedSearchTerm));
  }, [filterAgentsByClient, searchTerm]);

  return (
    <Layout>
      <div>
        {loading && <Loader />}
        <div className="relative">
          <div className="overflow-x-auto">
            <div className="min-w-screen min-h-screen flex justify-center bg-gray-100 font-sans overflow-hidden">
              <div className="w-full lg:w-5/6">
                <h1 className="text-2xl font-semibold leading-tigh mt-3 mb-3">
                  Attendance Overview
                </h1>
                <div className="flex items-center mb-4">
                  <button onClick={() => setModalNew(true)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Add Agent
                  </button>
                  <input
                    className="ml-4 px-4 py-2 border rounded"
                    type="text"
                    placeholder="Search by agent name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="ml-4 px-4 py-2 border rounded"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                  >
                    <option value="">All Clients</option>
                    {clients.map(client => (
                      <option key={client._id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Name</th>
                        {weekDays.map(day => (
                          <th key={day.date} className="text-left py-3 px-4 uppercase font-semibold text-sm">
                            {day.dayName}<br />{day.formattedDate}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {filteredAgents.map(agent => (
                        <tr key={agent._id} className="hover:bg-gray-100 cursor-pointer">
                          <td
                            className="text-left py-3 px-4"
                            onClick={() => handleAgentNameClick(agent)}
                          >
                            {agent.name}
                          </td>
                          {weekDays.map((day, dayIndex) => {
                            const attendanceEntry = attendance[agent._id]?.find(a => a.date === day.date);
                            const currentStatus = attendanceEntry ? attendanceEntry.status : 'present-of';
                            const extraHours = attendanceEntry ? attendanceEntry.extraHours : 0;

                            return (
                              <td
                                key={day.date}
                                className="text-left py-3 px-4"
                                onClick={() => handleCellClick(agent, dayIndex, currentStatus, extraHours)}
                              >
                                {currentStatus}{extraHours > 0 && ` (${extraHours}h)`}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => handleWeekChange('backward')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                  >
                    Previous Week
                  </button>
                  <button
                    onClick={() => handleWeekChange('forward')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                  >
                    Next Week
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for agent attendance entry */}
        {showModal && (
          <Modal
            title={`Update Status for ${selectedAgent.name}`}
            onClose={() => setShowModal(false)}
            onSave={saveAttendance}
          >
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="present-of">Present in Office</option>
                <option value="present-wfh">Present WFH</option>
                <option value="absent">Absent</option>
                <option value="sickleave">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="day-off">Day Off</option>
                <option value="work-holiday">Work Holiday</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Extra Hours:
              </label>
              <input
                type="number"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={extraHours}
                onChange={(e) => setExtraHours(e.target.value)}
                min="0"
                max="8"
              />
            </div>
          </Modal>
        )}

        {/* Modal for group status change */}
        {showGroupModal && (
          <Modal
            title="Group Status Update"
            onClose={() => setShowGroupModal(false)}
            onSave={async () => {
              try {
                setLoading(true);
                const fromDate = format(groupDate.from, 'yyyy-MM-dd');
                const toDate = format(groupDate.to, 'yyyy-MM-dd');
                const data = selectedAgents.map(agent => ({
                  agentId: agent._id,
                  fromDate,
                  toDate,
                  status,
                }));
                await axios.post('/api/attendance/group', data);
                fetchAttendance(currentWeekStart);
              } catch (error) {
                console.error('Error updating group status:', error);
              } finally {
                setLoading(false);
                setShowGroupModal(false);
              }
            }}
          >
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Status:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="present-of">Present in Office</option>
                <option value="present-wfh">Present WFH</option>
                <option value="absent">Absent</option>
                <option value="sickleave">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="day-off">Day Off</option>
                <option value="work-holiday">Work Holiday</option>
              </select>
            </div>
          </Modal>
        )}

      </div>
    </Layout>
  );
};

export default AttendancePage;
