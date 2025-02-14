import { useEffect, useState } from 'react';
import axios from 'axios';

function PageTimer() {
  const [startTime, setStartTime] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const pageLoadTime = window.performance.timing.domContentLoadedEventEnd;
    const currentTime = Date.now();
    const initialStartTime = currentTime - pageLoadTime;

    setStartTime(initialStartTime);

    const interval = setInterval(() => {
      const elapsed = Date.now() - initialStartTime;
      setTimeElapsed(elapsed);
    }, 60000); // Update time every second

    return () => clearInterval(interval); // Clear interval on component unmount

  }, []);

  useEffect(() => {
    const sendSessionDuration = async () => {
      try {
        // Sending session duration to the server
        await axios.post('/log-session-duration', {
          duration: timeElapsed,
          // Add other identifying information if needed (user ID, etc.)
        });
      } catch (error) {
        console.error('Error logging session duration:', error);
      }
    };

    if (timeElapsed > 0) {
      sendSessionDuration();
    }
  }, [timeElapsed]);

  // ...rest of the component remains the same
}
