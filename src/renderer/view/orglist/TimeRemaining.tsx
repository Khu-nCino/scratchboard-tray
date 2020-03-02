import React, { useState, useEffect } from 'react';

const oneDay = 1000 * 60 * 60 * 24;

export default function TimeRemaining(props: { className?: string, date: number }) {
  const [timeLeft, setTimeLeft] = useState(props.date - Date.now());

  useEffect(() => {
    let timeoutId = window.setTimeout(checkTimeLeft, timeLeft % oneDay);

    function checkTimeLeft() {
      const newTimeLeft = props.date - Date.now();
      setTimeLeft(newTimeLeft);
      timeoutId = window.setTimeout(checkTimeLeft, newTimeLeft % oneDay);
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [props.date]);

  const daysRemaining = Math.max(0, Math.floor(timeLeft / oneDay));
  const daysLabel = daysRemaining !== 1 ? "Days" : "Day";

  return (
    <div className={props.className}>
      {daysRemaining} {daysLabel} Remaining
    </div>
  );
}