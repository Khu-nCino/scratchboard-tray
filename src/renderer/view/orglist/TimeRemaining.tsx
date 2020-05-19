import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import { IpcMainEvent } from "common/IpcEvent";

const oneDay = 1000 * 60 * 60 * 24;

export default function TimeRemaining(props: {
  className?: string;
  date: number;
}) {
  const [, updateState] = useState<{} | undefined>();

  useEffect(() => {
    ipcRenderer.addListener(IpcMainEvent.WINDOW_OPENED, () => updateState({}));
    return () => {
      ipcRenderer.removeListener(IpcMainEvent.WINDOW_OPENED, () => updateState({}));
    };
  }, []);

  if (Number.isNaN(props.date)) {
    return <div className={props.className + ' bp3-skeleton'}>99 Days Remaining</div>
  }

  const timeLeft = props.date - Date.now();
  const daysRemaining = Math.max(0, Math.floor(timeLeft / oneDay));
  const daysLabel = daysRemaining === 1 ? "Day" : "Days";

  return (
    <div className={props.className}>
      {daysRemaining} {daysLabel} Remaining
    </div>
  );
}
