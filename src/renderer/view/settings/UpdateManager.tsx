import { ipcRenderer } from "electron";
import React from "react";
import { connect } from "react-redux";
import { Button } from "@blueprintjs/core";
import { UpdateStatus } from "../../store/updates"
import { State } from "../../store";
import { IpcEvent } from "../../../common/IpcEvent";

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

function UpdateButton(props: { status: UpdateStatus }) {
  switch (props.status) {
    case "initial":
      return <Button onClick={checkUpdates} >Check for Updates</Button>;
    case "checking":
      return <Button disabled>Checking...</Button>;
    case "downloading":
      return <Button disabled>Downloading...</Button>;
    case "downloaded":
      return <Button onClick={quitAndInstall}>Quit and Install</Button>
  }
}

function UpdateManager(props: Props) {
  return (
    <div className={props.className}>
      <UpdateButton status={props.updateStatus} />
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    updateStatus: state.updates.status,
    updateVersion: state.updates.updateVersion
  };
}

export default connect(mapStateToProps)(UpdateManager);
