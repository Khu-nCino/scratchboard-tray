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
  Dialog,
  InputGroup,
  Classes
} from "@blueprintjs/core";

import { AnyAction } from "redux";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";

import TimeRemaining from "./TimeRemaining";

import { ScratchOrg } from "../../api/sfdx";
import {
  openOrgAction,
  deleteOrgAction,
  copyFrontDoor,
  setAliasAction
} from "../../store/orgs";
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

function ActionMenu(props: {
  onCopyFrontdoor: () => void,
  onSetAlias: () => void,
  onDelete: () => void
}) {
  return (
    <Menu>
      <MenuItem text="Copy Frontdoor" onClick={props.onCopyFrontdoor} />
      <MenuItem text="Set Alias" onClick={props.onSetAlias} />
      <MenuItem
        text="Delete"
        intent="danger"
        onClick={props.onDelete}
      />
    </Menu>
  )
}

function AliasDialog(props: {
  value: string,
  onChange: (value: string) => void,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  return (
    <Dialog
      title="Set Alias"
      isOpen={props.isOpen}
      onClose={props.onClose}
      className="sbt-mh_medium"
    >
      <div className={Classes.DIALOG_BODY}>
        <InputGroup
          value={props.value || ''}
          placeholder="Alias"
          onChange={(event: React.FormEvent<HTMLElement>) =>
            props.onChange((event.target as HTMLInputElement).value)
          }
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button intent={Intent.NONE} onClick={props.onClose}>Cancel</Button>
          <Button intent={Intent.PRIMARY} onClick={() => {
            props.onConfirm();
            props.onClose();
          }}>Commit</Button>
        </div>
      </div>
    </Dialog>
  );
}

function DeleteConformation(props: {
  displayName: string,
  isOpen: boolean,
  onClose: () => void,
  onConfirm: () => void
}) {
  return (
    <Alert
      className="sbt-mh_medium"
      cancelButtonText="Cancel"
      confirmButtonText="Delete"
      icon="delete"
      intent={Intent.DANGER}
      isOpen={props.isOpen}
      onCancel={props.onClose}
      onConfirm={() => {
        props.onConfirm();
        props.onClose();
      }}
    >
      <p>Are you sure you would like to delete {props.displayName}?</p>
    </Alert>
  );
}

function OrgItem(props: Props) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingAlias, setPendingAlias] = useState(false);
  const [aliasValue, setAliasValue] = useState(props.org.alias ?? '');

  const orgDisplayName = props.org.alias || props.org.username;

  const orgExpirationDate = useMemo(
    () => Date.parse(props.org.expirationDate),
    [props.org.expirationDate]
  );

  const actionsMenu = <ActionMenu
    onCopyFrontdoor={props.copyFrontdoor}
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
    <div style={rootStyle} className="sbt-flex-container sbt-hover-highlight">
      <div className="sbt-flex-item">
        <h4 className="sbt-m_xx-small">{orgDisplayName}</h4>
        <TimeRemaining
          className="sbt-m_xx-small sbt-ml_small"
          date={orgExpirationDate}
        />
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
