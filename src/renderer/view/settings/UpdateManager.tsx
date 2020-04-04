import { ipcRenderer } from "electron";
import React from "react";
import { connect } from "react-redux";
import { Button, ProgressBar } from "@blueprintjs/core";
import { IpcEvent } from "common/IpcEvent";
import { UpdateStatus } from "../../store/updates";
import { State } from "../../store";
import appVersion from "../../app-version";

interface OwnProps {
  className?: string;
}

type StateProps = ReturnType<typeof mapStateToProps>;

type Props = OwnProps & StateProps;

function checkUpdates() {
  ipcRenderer.send(IpcEvent.CHECK_FOR_UPDATES_REQUEST);
}

function quitAndInstall() {
  ipcRenderer.send(IpcEvent.QUIT_AND_INSTALL_UPDATE_REQUEST);
}

function UpdateButton(props: { status: UpdateStatus; updateVersion?: string }) {
  switch (props.status) {
    case "initial":
      return (
        <Button className="sbt-flex-item--right" onClick={checkUpdates}>
          Check for Updates
        </Button>
      );
    case "checking":
      return (
        <Button className="sbt-flex-item--right" disabled>
          Check for Updates
        </Button>
      );
    case "downloading":
      return (
        <Button className="sbt-flex-item--right" disabled>
          Downloading...
        </Button>
      );
    case "downloaded":
      return (
        <Button className="sbt-flex-item--right" onClick={quitAndInstall}>
          Upgrade to Version {props.updateVersion}
        </Button>
      );
  }
}

function UpdateManager(props: Props) {
  return (
    <div className={props.className}>
      <div className="sbt-flex-container">
        <span>Version {appVersion}</span>
        <UpdateButton
          status={props.updateStatus}
          updateVersion={props.updateVersion}
        />
      </div>
      {props.downloadPercent !== undefined && (
        <ProgressBar
          className="sbt-mt_small"
          intent={props.updateStatus === "downloaded" ? "success" : "primary"}
          value={props.downloadPercent}
          stripes={false}
        />
      )}
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    updateStatus: state.updates.status,
    updateVersion: state.updates.updateVersion,
    downloadPercent: state.updates.downloadPercent,
  };
}

export default connect(mapStateToProps)(UpdateManager);
