import { ipcRenderer } from "electron";
import React from "react";
import { connect } from "react-redux";
import { Switch, Button, FormGroup } from "@blueprintjs/core";
import { IpcRendererEvent } from "common/IpcEvent";
import { ipcRenderer as ipc } from "electron-better-ipc";

import { State, CustomDispatch } from "renderer/store";
import { toggleTheme, toggleOpenAtLogin } from "renderer/store/settings";
import "./SettingsBody.scss";
import UpdateManager from "./UpdateManager";

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function quitApp() {
  ipcRenderer.send(IpcRendererEvent.QUIT_APP);
}

function SettingsBody(props: Props) {
  return (
    <div style={{ overflowY: "auto" }}>
      <UpdateManager className="sbt-m_medium" />
      <FormGroup label="Appearance & Behavior" className="sbt-mh_medium sbt-mt_medium">
        <Switch labelElement="Dark Mode" checked={props.isDarkTheme} onChange={props.toggleTheme} />
        <Switch
          labelElement="Run at Login"
          checked={props.openAtLogin}
          onChange={props.toggleOpenAtLogin}
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
  );
}

function mapStateToProps(state: State) {
  return {
    isDarkTheme: state.settings.theme === "dark",
    openAtLogin: state.settings.openAtLogin,
  };
}

function mapDispatchToProps(dispatch: CustomDispatch) {
  return {
    toggleTheme: () => dispatch(toggleTheme()),
    toggleOpenAtLogin: () => dispatch(toggleOpenAtLogin()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBody);
