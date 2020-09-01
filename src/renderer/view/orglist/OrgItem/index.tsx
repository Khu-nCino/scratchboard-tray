import React, { useState } from "react";
import { Button, ButtonGroup, Popover, Position } from "@blueprintjs/core";

import { connect, ConnectedProps } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";


import { SalesforceOrg } from "renderer/api/SalesforceOrg";
import { ScratchBoardState } from "renderer/store";
import {
  openOrgAction,
  deleteOrgAction,
  copyFrontDoor,
  setAliasAction,
  logoutOrgAction,
  OrgData,
} from "renderer/store/orgs";
import { ActionMenu } from "./ActionMenu";
import { TimeRemaining } from "./TimeRemaining";
import { DeleteConformation } from "./DeleteConformation";
import { InputTextDialog } from "renderer/view/InputTextDialog";
import { LogoutConfirmation } from "./LogoutConfirmation";
import { pushRoute } from "renderer/store/route";

interface OwnProps {
  org: OrgData<SalesforceOrg>;
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<ScratchBoardState, undefined, AnyAction>,
  ownProps: OwnProps
) {
  const { username } = ownProps.org.description;

  return {
    openOrg: () => dispatch(openOrgAction(username)),
    copyFrontdoor: () => dispatch(copyFrontDoor(username)),
    deleteOrg: () => dispatch(deleteOrgAction(username)),
    logoutOrg: () => dispatch(logoutOrgAction(username)),
    setAlias: (newAlias: string) => dispatch(setAliasAction(username, newAlias)),
    pushPackageRoute: () => dispatch(pushRoute("package", username)),
  };
}

const connector = connect(undefined, mapDispatchToProps);
type Props = OwnProps & ConnectedProps<typeof connector>;

export const OrgItem = connector((props: Props) => {
  const { description, state } = props.org;

  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const [pendingAlias, setPendingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(description.alias ?? "");

  const orgDisplayName = description.alias || description.username;

  const actionsMenu = (
    <ActionMenu
      removeAction={
        description.isScratchOrg
          ? description.scratchAdminUsername
            ? undefined
            : "delete"
          : "logout"
      }
      onCopyFrontdoor={props.copyFrontdoor}
      onSetAlias={() => {
        setAliasValue(description.alias ?? "");
        setPendingAlias(true);
      }}
      onDelete={() => setPendingDelete(true)}
      onLogout={() => setPendingLogout(true)}
      onPackages={props.pushPackageRoute}
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
      <LogoutConfirmation
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
});
