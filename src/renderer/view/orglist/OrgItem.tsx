import React from "react";
import { Button } from "@blueprintjs/core";
import { ScratchOrg } from "../../api/sfdx";

import { openOrg as openOrgApi } from '../../api/sfdx';

interface Props {
  org: ScratchOrg;
}

const rootStyle: React.CSSProperties = {
  display: 'flex',
  width: '100%',
  height: '50px'
}

const rightElm: React.CSSProperties = {
  margin: "auto 20px"
}

const leftElm: React.CSSProperties = {
  margin: "auto 20px auto auto"
}

export default class OrgItem extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.openOrg = this.openOrg.bind(this);
  }

  openOrg() {
    openOrgApi(this.props.org.username);
  }

  getOrgDisplayName() {
      return this.props.org.alias || this.props.org.username;
  }

  render() {
    return (
      <div style={rootStyle} >
        <h4 style={rightElm}>{this.getOrgDisplayName()}</h4>
        <span style={leftElm}><Button intent="primary" onClick={this.openOrg}>Open</Button></span>
      </div>
    );
  }
}
