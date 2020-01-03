import { ipcRenderer } from 'electron';

import React from "react";
import OrgList from './orglist/OrgList';
import { Button } from '@blueprintjs/core';

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
        <OrgList />
        <Button intent="danger" onClick={this.exit}>Exit</Button>
      </div>;
  }
}
