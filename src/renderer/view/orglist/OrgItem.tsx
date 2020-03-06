import React, { useState, useMemo } from "react";
import {
  Button,
  ButtonGroup,
  Popover,
  Menu,
  MenuItem,
  Position,
  Alert,
  Intent,
} from "@blueprintjs/core";

import { AnyAction } from "redux";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import TimeRemaining from './TimeRemaining';

import { ScratchOrg } from "../../api/sfdx";
import { openOrgAction, deleteOrgAction, copyFrontDoor } from "../../store/orgs";
import { State } from "../../store";

const rootStyle: React.CSSProperties = {
  width: "100%",
  height: "50px"
};

interface OwnProps {
  org: ScratchOrg;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & DispatchProps;


function OrgItem(props: Props) {
  const [pendingDelete, setPendingDelete] = useState(false);

  const orgDisplayName = props.org.alias || props.org.username;

  const orgExpirationDate = useMemo(
    () => Date.parse(props.org.expirationDate),
    [props.org.expirationDate]
  );

  const actionsMenu = (
    <Menu>
      <MenuItem text="Copy Frontdoor" onClick={props.copyFrontdoor} />
      <MenuItem text="Delete" intent="danger" onClick={() => setPendingDelete(true)} />
    </Menu>
  );

  const deleteConformation = <Alert
    cancelButtonText="Cancel"
    confirmButtonText="Delete"
    icon="delete"
    intent={Intent.DANGER}
    isOpen={pendingDelete}
    onCancel={() => setPendingDelete(false)}
    onConfirm={() => {
      setPendingDelete(false);
      props.deleteOrg();
    }}
  >
    <p>Are you sure you would like to delete {orgDisplayName}?</p>
  </Alert>;

  return (
    <div style={rootStyle} className="sbt-flex-container sbt-hover-highlight">
      <div className="sbt-flex-item">
        <h4 className="sbt-m_xx-small">{orgDisplayName}</h4>
        <TimeRemaining className="sbt-m_xx-small sbt-ml_small" date={orgExpirationDate} />
      </div>
      <ButtonGroup className="sbt-flex-item--right">
        <Button intent="primary" onClick={props.openOrg}>
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
      {deleteConformation}
    </div>
  );
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, undefined, AnyAction>, { org: { username } }: OwnProps) {
  return {
    openOrg: () => dispatch(openOrgAction(username)),
    copyFrontdoor: () => dispatch(copyFrontDoor(username)),
    deleteOrg: () => dispatch(deleteOrgAction(username))
  };
}

export default connect(undefined, mapDispatchToProps)(OrgItem);
