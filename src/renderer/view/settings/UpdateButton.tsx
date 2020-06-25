import React from "react";
import { ipcRenderer } from "electron";
import { IpcRendererEvent } from "common/IpcEvent";
import { Button } from "@blueprintjs/core";
import { UpdateStatus } from "renderer/store/updates";

function checkUpdates() {
  ipcRenderer.send(IpcRendererEvent.CHECK_FOR_UPDATES_REQUEST);
}

function quitAndInstall() {
  ipcRenderer.send(IpcRendererEvent.QUIT_AND_INSTALL_UPDATE_REQUEST);
}

interface Props {
  status: UpdateStatus;
  updateVersion?: string;
}

export function UpdateButton(props: Props) {
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
    default:
      return <Button disabled>Unknown Status</Button>;
  }
}