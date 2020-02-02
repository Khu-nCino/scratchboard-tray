import React from "react";
import { Button, ButtonGroup, Popover, Menu, MenuItem, Position } from "@blueprintjs/core";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ScratchOrg } from "../../api/sfdx";

import { viewDependencies } from "../../store/route";
import { openOrg as openOrgApi } from "../../api/sfdx";

import { margin } from "../style";

const rootStyle: React.CSSProperties = {
  display: "flex",
  width: "100%",
  height: margin.large
};

const rightElm: React.CSSProperties = {
  margin: `auto ${margin.medium}`
};

const leftElm: React.CSSProperties = {
  margin: `auto ${margin.medium} auto auto`
};

interface OwnProps {
  org: ScratchOrg;
}

interface DispatchProps {
  viewDependencies(username: string): any
}

type Props = OwnProps & DispatchProps;

class OrgItem extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.openOrg = this.openOrg.bind(this);
    this.viewDependencies = this.viewDependencies.bind(this);
  }

  openOrg() {
    openOrgApi(this.props.org.username);
  }

  viewDependencies() {
    this.props.viewDependencies(this.props.org.username);
  }

  getOrgDisplayName() {
    return this.props.org.alias || this.props.org.username;
  }

  getDaysRemaining() {
    const oneDay = 1000 * 60 * 60 * 24;
    const expirationDate = Date.parse(this.props.org.expirationDate);

    return Math.floor((expirationDate - Date.now()) / oneDay);
  }

  render() {
    const actionsMenu = (
      <Menu>
        <MenuItem text="Copy Link" />
        <MenuItem text="Dependencies" onClick={this.viewDependencies} />
        <MenuItem text="Delete" intent="danger" />
      </Menu>
    )

    return (
      <div style={rootStyle} className="hover-highlight" >
        <div style={rightElm}>
          <h4 style={{margin: '2px'}}>{this.getOrgDisplayName()}</h4>
          <div style={{margin: '2px 2px 2px 10px'}}>{this.getDaysRemaining()} Days Left</div>
        </div>
        <ButtonGroup style={leftElm}>
          <Button intent="primary" onClick={this.openOrg}>Open</Button>
          <Popover content={actionsMenu} position={Position.BOTTOM} boundary="viewport" >
            <Button intent="primary" icon="chevron-down" />
          </Popover>
        </ButtonGroup>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    viewDependencies: (username: string) => dispatch(viewDependencies(username))
  }
}

export default connect(undefined, mapDispatchToProps)(OrgItem)