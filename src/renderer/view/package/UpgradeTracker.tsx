import React, { useEffect, useState } from "react";

interface Props {
  startTime: number;
}

export const UpgradeTracker = (props: Props) => {
  const [elapsedTime, setElapsedTime] = useState(Date.now() - props.startTime);

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setElapsedTime(Date.now() - props.startTime);
    }, 1000);
    return () => {
      clearInterval(timeoutId);
    };
  });

  return <span className="sbt-ml_medium sbt-mv_medium">{`Time: ${formatMs(elapsedTime)}`}</span>
};

function formatMs(ms: number){
  const hours = Math.floor(ms / (1000 * 60 * 60) % 60);
  const minutes = Math.floor(ms / (1000 * 60) % 60);
  const seconds = Math.floor(ms / 1000 % 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(x: number): string {
  return x < 10 ? `0${x}` : `${x}`;
}