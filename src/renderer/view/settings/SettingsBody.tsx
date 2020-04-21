import { ipcRenderer } from "electron";
import React from "react";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import { Switch, Button, FormGroup } from "@blueprintjs/core";
import { IpcRendererEvent } from "common/IpcEvent";

import FileInput from "./FileInput";
import { State } from "../../store";
import {
  toggleTheme,
  setSfdxPath,
  toggleOpenAtLogin,
  toggleDisplayAllOrgs,
} from "../../store/settings";
import "./SettingsBody.scss";
import UpdateManager from "./UpdateManager";

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function exit() {
  ipcRenderer.send(IpcRendererEvent.EXIT_APP);
}

function SettingsBody(props: Props) {
  return (
    <div style={{ overflowY: "auto" }}>
      <UpdateManager className="sbt-m_medium" />
      <FormGroup
        label="Appearance & Behavior"
        className="sbt-mh_medium sbt-mt_medium"
      >
        <Switch
          labelElement="Dark Mode"
          checked={props.isDarkTheme}
          onChange={props.toggleTheme}
        />
        <Switch
          labelElement="Run at Login"
          checked={props.openAtLogin}
          onChange={props.toggleOpenAtLogin}
        />
      </FormGroup>
      <FormGroup label="Features" className="sbt-mh_medium sbt-mt_medium">
        <Switch
          labelElement="Display all org"
          checked={props.displayAllOrgs}
          onChange={props.toggleDisplayAllOrgs}
        />
      </FormGroup>
      <FormGroup label="SFDX Binary" className="sbt-mh_medium">
        <FileInput
          value={props.sfdxPath}
          onChange={props.setSfdxPath}
          isValid={props.isSfdxPathValid ?? false}
        />
      </FormGroup>
      <Button className="sbt-exit-button" intent="danger" onClick={exit}>
        Quit
      </Button>
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    isDarkTheme: state.settings.theme === "dark",
    sfdxPath: state.settings.sfdxPath,
    isSfdxPathValid: state.settings.isSfdxPathValid,
    openAtLogin: state.settings.openAtLogin,
    displayAllOrgs: state.settings.features.displayAllOrgs,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<State, undefined, AnyAction>
) {
  return {
    toggleTheme: () => dispatch(toggleTheme()),
    setSfdxPath: (path: string) => dispatch(setSfdxPath(path)),
    toggleOpenAtLogin: () => dispatch(toggleOpenAtLogin()),
    toggleDisplayAllOrgs: () => dispatch(toggleDisplayAllOrgs()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBody);
