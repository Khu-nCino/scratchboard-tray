import React, { useState } from "react";
import { Button, ButtonGroup, Popover, Position } from "@blueprintjs/core";

import { connect } from "react-redux";

import TimeRemaining from "../TimeRemaining";

import { SalesforceOrg } from "renderer/api/SalesforceOrg";
import {
  openOrgAction,
  deleteOrgAction,
  copyFrontDoor,
  setAliasAction,
  logoutOrgAction,
  OrgData,
} from "renderer/store/orgs";
import { CustomDispatch } from "renderer/store";
import ActionMenu from "./ActionMenu";
import DeleteConformation from "./DeleteConformation";
import InputTextDialog from "renderer/view/InputTextDialog";
import LogoutConformation from "./LogoutConformation";

interface OwnProps {
  org: OrgData<SalesforceOrg>;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & DispatchProps;

function OrgItem(props: Props) {
  const { description, state } = props.org;

  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [pendingAlias, setPendingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(description.alias ?? "");

  const orgDisplayName = description.alias || description.username;

  const actionsMenu = (
    <ActionMenu
      isScratchOrg={description.isScratchOrg}
      onCopyFrontdoor={props.copyFrontdoor}
      onSetAlias={() => {
        setAliasValue(description.alias ?? "");
        setPendingAlias(true);
      }}
      onDelete={() => setPendingDelete(true)}
      onLogout={() => setPendingLogout(true)}
      onPackages={async () => {
        
      }}
    />
  );

  const dialogs = (
    <>
      <InputTextDialog
        titleText="Set Alias"
        placeholderText="Alias"
        value={aliasValue}
        onChange={setAliasValue}
        isOpen={pendingAlias}
        onClose={() => setPendingAlias(false)}
        onConfirm={() => {
          props.setAlias(aliasValue);
        }}
      />
      <DeleteConformation
        displayName={orgDisplayName}
        isOpen={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={props.deleteOrg}
      />
      <LogoutConformation
        displayName={orgDisplayName}
        isOpen={pendingLogout}
        onClose={() => setPendingLogout(false)}
        onConfirm={props.logoutOrg}
      />
    </>
  );

  const timeRemaining = description.isScratchOrg && (
    <TimeRemaining
      className="sbt-m_xx-small sbt-ml_small"
      date={Date.parse(description.expirationDate)}
    />
  );

  return (
    <div className="sbt-org-list--item sbt-flex-container sbt-hover-highlight">
      <div className="sbt-ml_medium">
        <h4 className="sbt-m_xx-small">{orgDisplayName}</h4>
        {timeRemaining}
      </div>
      <ButtonGroup className="sbt-flex-item--right sbt-mr_medium">
        <Button intent="primary" onClick={props.openOrg} loading={state.pendingAction}>
          Open
        </Button>
        <Popover
          content={actionsMenu}
          position={Position.BOTTOM}
          disabled={state.pendingAction}
          boundary="viewport"
        >
          <Button intent="primary" icon="chevron-down" disabled={state.pendingAction} />
        </Popover>
      </ButtonGroup>
      {dialogs}
    </div>
  );
}

function mapDispatchToProps(dispatch: CustomDispatch, ownProps: OwnProps) {
  const username = ownProps.org.description.username;

  return {
    openOrg: () => dispatch(openOrgAction(username)),
    copyFrontdoor: () => dispatch(copyFrontDoor(username)),
    deleteOrg: () => dispatch(deleteOrgAction(username)),
    logoutOrg: () => dispatch(logoutOrgAction(username)),
    setAlias: (newAlias: string) => dispatch(setAliasAction(username, newAlias)),
  };
}

export default connect(undefined, mapDispatchToProps)(OrgItem);
