import { ipcRenderer } from "electron";
import React, { useState } from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Switch, Button } from '@blueprintjs/core';

import FileInput from './FileInput';
import { State } from "../../store";
import { toggleTheme } from "../../store/settings";
import "./SettingsBody.scss";


type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function exit() {
  ipcRenderer.send("exit");
}

function SettingsBody(props: Props) {
  const [ sfdxPath, setSfdxPath ] = useState('');

  return <div>
    <Switch labelElement={"Dark Mode"} checked={props.isDarkTheme} onChange={props.toggleTheme} inline large />
    <FileInput value={sfdxPath} onChange={setSfdxPath} />
    <Button className="sbt-exit-button" intent="danger" onClick={exit}>Exit</Button>
  </div>;
}

function mapStateToProps(state: State) {
  return {
    isDarkTheme: state.settings.theme === 'dark'
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    toggleTheme: () => dispatch(toggleTheme())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsBody);