import React, { useState, useEffect, useMemo } from "react";
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

import { ScratchOrg } from "../../api/sfdx";

import { viewDependencies } from "../../store/route";

import { openOrgAction } from "../../store/orgs";
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

const oneDay = 1000 * 60 * 60 * 24;

function TimeRemaining(props: { className?: string, date: number }) {
  const [timeLeft, setTimeLeft] = useState(props.date - Date.now());

  useEffect(() => {
    let timeoutId = window.setTimeout(checkTimeLeft, timeLeft % oneDay);

    function checkTimeLeft() {
      const newTimeLeft = props.date - Date.now();
      setTimeLeft(newTimeLeft);
      timeoutId = window.setTimeout(checkTimeLeft, newTimeLeft % oneDay);
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [props.date]);

  const daysRemaining = Math.max(0, Math.floor(timeLeft / oneDay));
  const daysLabel = daysRemaining !== 1 ? "Days" : "Day";

  return (
    <div className={props.className}>
      {daysRemaining} {daysLabel} Remaining
    </div>
  );
}

function OrgItem(props: Props) {
  const [pendingDelete, setPendingDelete] = useState(false);

  const orgDisplayName = props.org.alias || props.org.username;

  const orgExpirationDate = useMemo(
    () => Date.parse(props.org.expirationDate),
    [props.org.expirationDate]
  );

  const actionsMenu = (
    <Menu>
      <MenuItem text="Copy Link" />
      <MenuItem text="Dependencies" onClick={props.viewDependencies} />
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
    onConfirm={() => setPendingDelete(false)}
  >
    <p>Are you sure you would like to delete {orgDisplayName}?</p>
  </Alert>;

  return (
    <div style={rootStyle} className="sbt-flex-container sbt-hover-highlight">
      <div className="sbt-flex-item">
        <h4 className="sbt-m_xx-small">{orgDisplayName}</h4>
        <TimeRemaining className="sbt-m_small sbt-mt_none" date={orgExpirationDate}/>
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

function mapDispatchToProps(dispatch: ThunkDispatch<State, undefined, AnyAction>, ownProps: OwnProps) {
  return {
    viewDependencies: () => dispatch(viewDependencies(ownProps.org.username)),
    openOrg: () => dispatch(openOrgAction(ownProps.org.username))
  };
}

export default connect(undefined, mapDispatchToProps)(OrgItem);
