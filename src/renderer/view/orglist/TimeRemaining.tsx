import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
import { IpcEvent } from '../../../common/IpcEvent';

const oneDay = 1000 * 60 * 60 * 24;

export default function TimeRemaining(props: { className?: string, date: number }) {
  const [timeLeft, setTimeLeft] = useState(props.date - Date.now());

  function checkTimeLeft() {
    const nextTimeLeft = props.date - Date.now();
    setTimeLeft(nextTimeLeft);
  }

  useEffect(() => {
    ipcRenderer.addListener(IpcEvent.WINDOW_OPENED, checkTimeLeft);
    return () => {
      ipcRenderer.removeListener(IpcEvent.WINDOW_OPENED, checkTimeLeft);
    };
  }, []);

  const daysRemaining = Math.max(0, Math.floor(timeLeft / oneDay));
  const daysLabel = daysRemaining === 1 ? "Day" : "Days";

  return (
    <div className={props.className}>
      {daysRemaining} {daysLabel} Remaining
    </div>
  );
}