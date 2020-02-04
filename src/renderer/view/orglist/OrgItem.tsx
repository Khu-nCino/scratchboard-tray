import React, { useCallback } from "react";
import {
  Button,
  ButtonGroup,
  Popover,
  Menu,
  MenuItem,
  Position
} from "@blueprintjs/core";
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
  viewDependencies(): any;
}

type Props = OwnProps & DispatchProps;

function getOrgDisplayName(props: Props) {
  return props.org.alias || props.org.username;
}

function getDaysRemaining(props: Props) {
  const oneDay = 1000 * 60 * 60 * 24;
  const expirationDate = Date.parse(props.org.expirationDate);
  return Math.floor((expirationDate - Date.now()) / oneDay);
}

function OrgItem(props: Props) {
  const openOrg = useCallback(() => {
    openOrgApi(props.org.username);
  }, [props.org.username]);

  const actionsMenu = (
    <Menu>
      <MenuItem text="Copy Link" />
      <MenuItem
        text="Dependencies"
        onClick={props.viewDependencies}
      />
      <MenuItem text="Delete" intent="danger" />
    </Menu>
  );

  return (
    <div style={rootStyle} className="hover-highlight">
      <div style={rightElm}>
        <h4 style={{ margin: "2px" }}>{getOrgDisplayName(props)}</h4>
        <div style={{ margin: "2px 2px 2px 10px" }}>
          {getDaysRemaining(props)} Days Left
        </div>
      </div>
      <ButtonGroup style={leftElm}>
        <Button intent="primary" onClick={openOrg}>
          Open
        </Button>
        <Popover
          content={actionsMenu}
          position={Position.BOTTOM}
          boundary="viewport"
        >
          <Button intent="primary" icon="chevron-down" />
        </Popover>
      </ButtonGroup>
    </div>
  );
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    viewDependencies: () => dispatch(viewDependencies(ownProps.org.username))
  };
}

export default connect(undefined, mapDispatchToProps)(OrgItem);
