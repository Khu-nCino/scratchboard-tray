import { ipcRenderer } from "electron";
import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Switch, Button, FormGroup } from "@blueprintjs/core";

import FileInput from "./FileInput";
import { State } from "../../store";
import { toggleTheme, setSfdxPath } from "../../store/settings";
import "./SettingsBody.scss";

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function exit() {
  ipcRenderer.send("exit");
}

function SettingsBody(props: Props) {
  return (
    <div>
      <FormGroup
        label="Appearance"
        className="sbt-m-horizontal_medium sbt-m-top_medium"
      >
        <Switch
          labelElement={"Dark Mode"}
          checked={props.isDarkTheme}
          onChange={props.toggleTheme}
          inline
        />
      </FormGroup>
      <FormGroup
        label="SFDX Directory"
        className="sbt-m-horizontal_medium"
      >
        <FileInput
          value={props.sfdxPath}
          onChange={props.setSfdxPath}
        />
      </FormGroup>
      <Button className="sbt-exit-button" intent="danger" onClick={exit}>
        Exit
      </Button>
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    isDarkTheme: state.settings.theme === "dark",
    sfdxPath: state.settings.sfdxPath
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    toggleTheme: () => dispatch(toggleTheme()),
    setSfdxPath: (path: string) => dispatch(setSfdxPath(path))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBody);
