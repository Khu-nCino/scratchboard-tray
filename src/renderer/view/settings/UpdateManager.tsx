import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ProgressBar } from "@blueprintjs/core";
import { State } from "renderer/store";
import { UpdateButton } from "./UpdateButton";

function mapStateToProps(state: State) {
  const {
    status,
    appVersion,
    updateVersion,
    downloadPercent
  } = state.updates;

  return {
    updateStatus: status,
    appVersion,
    updateVersion,
    downloadPercent,
  };
}

const connector = connect(mapStateToProps);

interface Props extends ConnectedProps<typeof connector> {
  className?: string;
}

export const UpdateManager = connector((props: Props) => {
  const downloadedStatus = props.updateStatus === "downloaded";

  return (
    <div className={props.className}>
      <div className="sbt-flex-container">
        <span>Version {props.appVersion}</span>
        <UpdateButton status={props.updateStatus} updateVersion={props.updateVersion} />
      </div>
      {props.downloadPercent !== undefined && (
        <ProgressBar
          className="sbt-mt_small"
          intent={downloadedStatus ? "success" : "primary"}
          value={props.downloadPercent}
          stripes={!downloadedStatus}
        />
      )}
    </div>
  );
});
