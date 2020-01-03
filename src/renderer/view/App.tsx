import React from "react";
import OrgList from './OrgList';

export default class App extends React.Component {
  render() {
    return <div className="app-content bp3-dark">
        <OrgList />
      </div>;
  }
}
