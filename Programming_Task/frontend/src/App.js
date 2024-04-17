import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import DatePicker from 'react-datepicker';
import { Bar } from 'react-chartjs-2';
import 'react-datepicker/dist/react-datepicker.css';


function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [buttonTime, setButtonTime] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [generatedSamples, setGeneratedSamples] = useState([]);

  
  const generateSamples = () => {
    const samples = [];
    const sampleCount = 10;
    for (let i = 0; i < sampleCount; i++) {
      const randomValue = Math.random();
      const sample = {
        ts: new Date().toISOString(),
        machine_status: randomValue > 0.5 ? 1 : 0,
      };
      samples.push(sample);
    }
    setGeneratedSamples(samples);
  };

  useEffect(() => {
    generateSamples();
  }, []);

  const formatDate = (date) => {
    return date ? date.toISOString().slice(0, -5) + 'Z' : '';
  };



  const fetchData = async () => {
    try {
      const startTimeUTC = startTime ? new Date(startTime.getTime() - startTime.getTimezoneOffset() * 60000).toISOString().slice(0, -5) + 'Z' : '';
      const endTimeUTC = endTime ? new Date(endTime.getTime() - endTime.getTimezoneOffset() * 60000).toISOString().slice(0, -5) + 'Z' : '';
      const buttonTimeUTC = buttonTime ? new Date(buttonTime.getTime() - buttonTime.getTimezoneOffset() * 60000).toISOString().slice(0, -5) + 'Z' : '';

      const response = await axios.get(`http://localhost:5000/data?start_time=${startTimeUTC}&end_time=${endTimeUTC}`);
      setData(response.data.data);
      setSummary(response.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startTime, endTime]);


  const chartData = {
    labels: data.map(d => d.ts),
    datasets: [
      {
        label: 'cycle Status',
        data: data.map(d => d.machine_status),
        backgroundColor: data.map(d => d.machine_status === 0 ? 'rgb(255, 255, 0)' : 'rgb(0, 255, 0)'),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };



  const options = {
    indexAxis: 'y',
    aspectRatio: 2,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
      y: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'YYYY-MM-DD HH:mm:ss',
          },
        },
        title: {
          display: true,
          text: 'Timestamp',
        },
      },
    },
  };



  const handleButtonClick = (duration) => {
    const newStartTime = buttonTime ? new Date(buttonTime) : new Date();
    setStartTime(newStartTime);

    const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 60 * 1000);
    setEndTime(newEndTime);

    fetchData();
  };


  const fetchTemperature = async (latitude, longitude) => {
    const API_KEY = '9b3b6fe912b5bbb83e12524f97161d97';
    const apiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric";

    try {
      const response = await axios.get(apiUrl);
      // Check if temperature data is present in the response
      if (response.data && response.data.main && response.data.main.temp) {
        // Set the temperature state
        setTemperature(response.data.main.temp);
      } else {
        console.error('Temperature data not found in the response');
      }
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    }
  };


  
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        fetchTemperature(latitude, longitude);
      }, (error) => {
        console.error('Error getting user location:', error);
      });
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  
  useEffect(() => {
    getUserLocation();
  }, []);


  return (
    <div>
    <hr />
    <div className='container'>
      <div>
        <DatePicker
          selected={buttonTime}
          onChange={(date) => setButtonTime(date)}
          showTimeSelect
          timeFormat="HH:mm:ss"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd'T'HH:mm:ss'Z'"
        />
        <button className='btn btn-dark' onClick={() => handleButtonClick(1)}>1hr</button>
        <button className='btn btn-primary' onClick={() => handleButtonClick(8)}>8hr</button>
        <button className='btn btn-secondary' onClick={() => handleButtonClick(24)}>24hr</button>
      </div>
      <hr />
      <div>
        <label>Start Time:</label>
        <DatePicker
          selected={startTime}
          onChange={(date) => setStartTime(date)}
          showTimeSelect
          timeFormat="HH:mm:ss"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd'T'HH:mm:ss'Z'"
        />
      </div>
      <br />
      <div>
        <label>End Time:</label>
        <DatePicker
          selected={endTime}
          onChange={(date) => setEndTime(date)}
          showTimeSelect
          timeFormat="HH:mm:ss"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd'T'HH:mm:ss'Z'"
        />
      </div>
      <br />
      <button className="btn btn-info" onClick={fetchData}>Fetch Data</button>
    </div>
    <hr />
    <div className="container">
      <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Number of Ones</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Number of Zeros</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid black', padding: '8px' }}>{summary.numOnes}</td>
            <td style={{ border: '1px solid black', padding: '8px' }}>{summary.numZeros}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <hr />
    <div className='container'>
      <p>Temperature: {temperature}°C</p>
    </div>
    <hr />
    <div>
      <hr />
      <div className='container'>
        <div>
          <h2>Generated Samples</h2>
          <ul>
            {generatedSamples.map((sample, index) => (
              <li key={index}>
                Timestamp: {sample.ts}, Machine Status: {sample.machine_status}
              </li>
            ))}
          </ul>
        </div>
        <hr />
      </div>
    </div>
    <hr />
    <Line data={chartData} />
    <hr />
  </div>
  );
}

export default App;