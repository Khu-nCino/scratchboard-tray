import React from "react";
import { Button } from "@blueprintjs/core";

interface Props {
  versionsCheckedTimestamp?: number;
  upgradeInProgress: boolean;
  onClick: () => void;
}

export const OrgListRefresh = (props: Props) => (
  <>
    {props.versionsCheckedTimestamp && (
      <span className="sbt-ml_medium sbt-mv_medium">
        {new Date(props.versionsCheckedTimestamp).toDateString()}
      </span>
    )}
    <Button
      className="sbt-ml_none sbt-mv_medium"
      minimal
      icon="refresh"
      disabled={props.upgradeInProgress}
      onClick={props.onClick}
    />
  </>
);
