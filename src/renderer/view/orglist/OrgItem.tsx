import React from "react";
import { Button } from "@blueprintjs/core";
import { ScratchOrg } from "../../api/sfdx";

interface Props {
  org: ScratchOrg;
}

const flexLayout: React.CSSProperties = {
    display: 'flex'
}

export default class OrgItem extends React.Component<Props> {
  getOrgDisplayName() {
      return this.props.org.alias || this.props.org.username;
  }

  render() {
    return (
      <div style={flexLayout} >
        <span>{this.getOrgDisplayName()}</span>
        <Button intent="primary">Open</Button>
      </div>
    );
  }
}
