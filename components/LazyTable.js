// LazyTable.js
import React from 'react';
import Loader from '@/components/Loader';

const LazyTable = ({ filteredAgents, weekDays, attendance, handleCellClick, handleAgentNameClick, toggleAgentSelection, selectedAgents, Loading }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              onChange={toggleAgentSelection}
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
        {Loading ? (
          <tr>
            <td colSpan={weekDays.length + 2}>
              <Loader />
            </td>
          </tr>
        ) : (
          filteredAgents.map((agent) => (
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
              {weekDays.map(({ date }, index) => {
                const entry = attendance[agent._id]?.find(entry => entry.date === date);
                const currentStatus = entry?.status || 'N/A';
                const extraHours = entry?.extraHours || 0;

                return (
                  <td
                    key={index}
                    style={{ backgroundColor: getStatusColor(currentStatus), cursor: 'pointer' }}
                    onClick={() => handleCellClick(agent, index, currentStatus, extraHours)}
                    className="cell-border"
                  >
                    {getStatusText(currentStatus)} <br />
                    {extraHours > 0 && <span>Extra Hours: {extraHours}</span>}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
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
export default LazyTable;
