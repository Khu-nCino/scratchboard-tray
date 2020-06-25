import { ipcRenderer } from "electron";
import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Switch, Button, FormGroup } from "@blueprintjs/core";
import { IpcRendererEvent } from "common/IpcEvent";
import { ipcRenderer as ipc } from "electron-better-ipc";

import { State } from "renderer/store";
import {
  toggleTheme,
  toggleOpenAtLogin,
  toggleShowSecondaryScratchUsernames,
} from "renderer/store/settings";
import { UpdateManager } from "./UpdateManager";
import "./SettingsBody.scss";

function quitApp() {
  ipcRenderer.send(IpcRendererEvent.QUIT_APP);
}

function mapStateToProps(state: State) {
  return {
    isDarkTheme: state.settings.theme === "dark",
    openAtLogin: state.settings.openAtLogin,
    showSecondaryScratchUsernames: state.settings.showSecondaryScratchUsernames,
  };
}

const mapDispatchToProps = {
  toggleTheme,
  toggleOpenAtLogin,
  toggleShowSecondaryScratchUsernames,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export const SettingsBody = connector((props: Props) => (
  <div style={{ overflowY: "auto" }}>
    <UpdateManager className="sbt-m_medium" />
    <FormGroup label="Appearance & Behavior" className="sbt-mh_medium">
      <Switch labelElement="Dark Mode" checked={props.isDarkTheme} onChange={props.toggleTheme} />
      <Switch
        labelElement="Run at Login"
        checked={props.openAtLogin}
        onChange={props.toggleOpenAtLogin}
      />
    </FormGroup>
    <FormGroup label="Org List" className="sbt-mh_medium">
      <Switch
        labelElement="Show Secondary Usernames"
        checked={props.showSecondaryScratchUsernames}
        onChange={props.toggleShowSecondaryScratchUsernames}
      />
    </FormGroup>
    <div className="sbt-mh_medium">
      <Button
        className="sbt-mr_small sbt-mb_small"
        onClick={() => {
          ipc.callMain(IpcRendererEvent.SHOW_LOGS_IN_FOLDER);
        }}
      >
        Open Log Folder
      </Button>
      <Button
        className="sbt-mb_small"
        onClick={() => {
          ipc.callMain(IpcRendererEvent.SHOW_APP_DATA_IN_FOLDER);
        }}
      >
        Open AppData Folder
      </Button>
    </div>
    <Button className="sbt-exit-button" intent="danger" onClick={quitApp}>
      Quit
    </Button>
  </div>
));
