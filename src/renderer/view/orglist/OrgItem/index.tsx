import React, { useState, useMemo } from "react";
import {
  Button,
  ButtonGroup,
  Popover,
  Position,
} from "@blueprintjs/core";

import { AnyAction } from "redux";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import TimeRemaining from "../TimeRemaining";

import { ScratchOrg } from "../../../api/sfdx";
import {
  openOrgAction,
  deleteOrgAction,
  copyFrontDoor,
  setAliasAction
} from "../../../store/orgs";
import { State } from "../../../store";
import ActionMenu from "./ActionMenu";
import AliasDialog from "./AliasDialog";
import DeleteConformation from "./DeleteConformation";

interface OwnProps {
  org: ScratchOrg;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & DispatchProps;

function OrgItem(props: Props) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingAlias, setPendingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(props.org.alias ?? '');
  const [isLoading, setLoading] = useState(false);

  const orgDisplayName = props.org.alias || props.org.username;

  const orgExpirationDate = useMemo(
    () => Date.parse(props.org.expirationDate),
    [props.org.expirationDate]
  );

  const actionsMenu = <ActionMenu
    onCopyFrontdoor={async () => {
      setLoading(true);
      try {
        await props.copyFrontdoor();
      } finally {
        setLoading(false);
      }
    }}
    onSetAlias={() => {
      setAliasValue(props.org.alias ?? '');
      setPendingAlias(true);
    }}
    onDelete={() => setPendingDelete(true)}
  />

  const dialogs = <>
    <AliasDialog
      value={aliasValue}
      onChange={setAliasValue}
      isOpen={pendingAlias}
      onClose={() => setPendingAlias(false)}
      onConfirm={() => props.setAlias(aliasValue)}
    />
    <DeleteConformation
      displayName={orgDisplayName}
      isOpen={pendingDelete}
      onClose={() => setPendingDelete(false)}
      onConfirm={props.deleteOrg}
    />
  </>;


  return (
    <div className="sbt-org-list--item sbt-flex-container sbt-hover-highlight">
      <div className="sbt-ml_medium">
        <h4 className="sbt-m_xx-small">{orgDisplayName}</h4>
        <TimeRemaining
          className="sbt-m_xx-small sbt-ml_small"
          date={orgExpirationDate}
        />
      </div>
      <ButtonGroup className="sbt-flex-item--right sbt-mr_medium">
        <Button intent="primary" onClick={async () => {
          setLoading(true);
          try {
            await props.openOrg();
          } finally {
            setLoading(false);
          }
        }} loading={isLoading}>
          Open
        </Button>
        <Popover
          content={actionsMenu}
          position={Position.BOTTOM}
          boundary="viewport"
        >
          <Button intent="primary" icon="chevron-down" disabled={isLoading} />
        </Popover>
      </ButtonGroup>
      {dialogs}
    </div>
  );
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<State, undefined, AnyAction>,
  { org: { username } }: OwnProps
) {
  return {
    openOrg: () => dispatch(openOrgAction(username)),
    copyFrontdoor: () => dispatch(copyFrontDoor(username)),
    deleteOrg: () => dispatch(deleteOrgAction(username)),
    setAlias: (alias: string) => dispatch(setAliasAction(username, alias))
  };
}

export default connect(undefined, mapDispatchToProps)(OrgItem);
