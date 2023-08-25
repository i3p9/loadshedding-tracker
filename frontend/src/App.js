import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { formatDistanceToNow, formatDistanceToNowStrict, differenceInMinutes, differenceInHours, differenceInDays, formatRelative } from 'date-fns';

function App() {
  const [data, setData] = useState(null)
  const [powerStatus, setPowerStatus] = useState(null)
  const [relativeTime, setRelativeTime] = useState("")
  const [totalPowerOffTime, setTotalPowerOffTime] = useState("")
  const [totalPowerOffCount, setTotalPowerOffCount] = useState(0)
  const [lastLoadShedding, setLastLoadShedding] = useState(null)

  //get current loadShedding Data, loads last 30 days
  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch("https://loadshedding-backend.onrender.com/loadshedding", requestOptions)
      .then(response => response.json())
      .then(response => {
        if (response.length > 0) {
          const lastItem = response[response.length - 1];
          setPowerStatus(lastItem);
        }
        setData(response)
      })
      .catch(error => console.log('error', error));
  }, [])

  //get relative time from last power state change
  useEffect(() => {
    if (powerStatus) {
      const formattedTimestamp = new Date(powerStatus.timestamp);
      setRelativeTime(getTimeDifference(formattedTimestamp))

    }
  }, [powerStatus])

  //get last load shedding time
  useEffect(() => {
    const now = new Date();
    if (data) {
      const allOffStatus = data.filter((item) => item.status.toLowerCase() === "off")
      const lastOffItem = allOffStatus[allOffStatus.length - 1]
      const lastOffItemTime = new Date(lastOffItem.timestamp)
      const lastOffItemFixedForTZ = new Date(lastOffItemTime.valueOf() - lastOffItemTime.getTimezoneOffset() * 60 * 1000)
      //console.log(lastOffItemFixedForTZ);
      setLastLoadShedding(formatRelative(lastOffItemFixedForTZ, now))
    }
  }, [data])


  function getTimeDifference(timestamp) {
    const now = new Date();
    const targetDate = new Date(timestamp);
    const targetDateFixedForTZ = new Date(targetDate.valueOf() - targetDate.getTimezoneOffset() * 60 * 1000)

    const diffInMinutes = differenceInMinutes(now, targetDateFixedForTZ);
    const diffInHours = differenceInHours(now, targetDateFixedForTZ);
    const diffInDays = differenceInDays(now, targetDateFixedForTZ);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes`;
    } else if (diffInHours < 24) {
      const minutesRemaining = diffInMinutes % 60;
      return `${diffInHours} hours and ${minutesRemaining} minutes`;
    } else {
      const hoursRemaining = diffInHours % 24;
      const minutesRemaining = diffInMinutes % 60;
      return `${diffInDays} days, ${hoursRemaining} hours, and ${minutesRemaining} minutes`;
    }
  }

  // converts ms value to x hours, y minutes (and or) z seconds format. STRING
  function formatDuration(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    //omit seconds for now until we are sure of the data's correctness
    //return `${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
    return `${hours} hours, ${minutes} minutes`;
  }

  //calculates total how many times power was cut
  //and how long the total duration was
  function calculateTotalOffDuration(data) {
    let totalDuration = 0;
    let totalCount = 0

    for (let i = 0; i < data.length; i++) {
      if (data[i].status === "OFF") {
        const currentTimestamp = new Date(data[i].timestamp);
        const nextTimestamp = i + 1 < data.length ? new Date(data[i + 1].timestamp) : new Date();

        const duration = nextTimestamp - currentTimestamp;
        totalDuration += duration;
        totalCount += 1;
      }
    }

    return [formatDuration(totalDuration), totalCount];
  }


  //total loadshedding count today
  useEffect(() => {
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch("https://loadshedding-backend.onrender.com/loadshedding/today?timezone=Asia%2FDhaka", requestOptions)
      .then(response => response.json())
      .then(response => {
        let res = calculateTotalOffDuration(response)
        setTotalPowerOffTime(res[0])
        setTotalPowerOffCount(res[1])
      })
      .catch(error => console.log('error', error));
  }, [])


  return (
    <div className="App">
      <div style={{ paddingTop: "20px" }}>{powerStatus?.status.toLowerCase() === "on" ? "🔌" : "🕯"}</div>
      <p>Current Status: {powerStatus?.status.toLowerCase() === "on" ? "⚡ Power is Present" : "🌚 Load Shedding"}</p>
      <p>Time since power was {powerStatus?.status.toLowerCase() === "on" ? "restored" : "cut"}: {relativeTime}</p>
      {powerStatus?.status.toLowerCase() === "on" && (
        <p>last loadshedding: {lastLoadShedding}</p>
      )}
      <p>number of times power was cut today: {totalPowerOffCount}</p>
      <p>total duration: 📈{totalPowerOffTime}</p>
      <br></br>
      <p>-----</p>
      <footer>note: this is purely experimental, actual data may or may not be right</footer>
    </div>
  );
}

export default App;
