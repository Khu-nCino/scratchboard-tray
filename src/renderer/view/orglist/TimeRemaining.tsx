import React, { useState, useEffect } from 'react';

const oneDay = 1000 * 60 * 60 * 24;
const timerOffset = 1000;

function nextTimeout(callback: () => void, timeLeft: number): number | undefined {
  const delay = timeLeft % oneDay + timerOffset;
  if (delay > 0) {
    return window.setTimeout(callback, delay);
  } else {
    return undefined;
  }
}

export default function TimeRemaining(props: { className?: string, date: number }) {
  const [timeLeft, setTimeLeft] = useState(props.date - Date.now());

  useEffect(() => {
    let timeoutId = nextTimeout(checkTimeLeft, timeLeft);

    function checkTimeLeft() {
      const nextTimeLeft = props.date - Date.now();
      setTimeLeft(nextTimeLeft);
      timeoutId = nextTimeout(checkTimeLeft, nextTimeLeft);
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