import { ipcRenderer } from "electron";
import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Switch, Button } from "@blueprintjs/core";

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
      <Switch
        labelElement={"Dark Mode"}
        checked={props.isDarkTheme}
        onChange={props.toggleTheme}
        className="sbt-m_medium"
        inline
        large
      />
      <FileInput
        value={props.sfdxPath}
        onChange={props.setSfdxPath}
        className="sbt-m-horizontal_medium"
      />
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
