import { ipcRenderer } from 'electron';

import React from "react";
import OrgList from './orglist/OrgList';
import Title from './Title';
import { Button } from '@blueprintjs/core';
import { borderMargin } from './style';

const exitContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: borderMargin,
  right: borderMargin
}

export default class App extends React.Component {
  constructor(props: {}) {
    super(props);
    this.exit = this.exit.bind(this);
  }

  exit() {
    ipcRenderer.send('exit');
  }

  render() {
    return <div className="app-content bp3-dark">
        <Title />
        <OrgList />
        <div style={exitContainerStyle} >
          <Button intent="danger" onClick={this.exit}>Exit</Button>
        </div>
      </div>;
  }
}
