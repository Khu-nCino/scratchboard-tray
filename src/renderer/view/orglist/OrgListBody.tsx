import React from "react";

import { connect, ConnectedProps } from "react-redux";

import { State } from "renderer/store";
import { selectSharedOrgs, selectScratchOrgs } from "renderer/store/orgs";
import { toggleExpansion } from "renderer/store/expanded";
import { OrgItem } from "./OrgItem";
import { CollapseGroup } from "../CollapseGroup";
import { pushRoute } from "renderer/store/route";

function mapStateToProps(state: State) {
  const {
    expanded: { sharedOrgs: sharedExpanded, scratchOrgs: scratchExpanded },
    settings: { showSecondaryScratchUsernames },
  } = state;

  return {
    scratchOrgList: selectScratchOrgs(state, showSecondaryScratchUsernames),
    sharedOrgList: selectSharedOrgs(state),
    sharedExpanded,
    scratchExpanded,
  };
}

const mapDispatchToProps = {
  pushRoute,
  toggleExpansion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export const OrgListBody = connector((props: Props) => (
  <div className="sbt-org-list">
    <CollapseGroup
      title="Shared Orgs"
      auxButtonIcon="plus"
      isOpen={props.sharedExpanded}
      onToggleOpen={() => props.toggleExpansion("sharedOrgs")}
      onAuxButtonClick={() => props.pushRoute("login")}
      auxButtonTip="Authenticate Org"
    >
      {props.sharedOrgList.map((org) => (
        <OrgItem key={org.description.username} org={org}></OrgItem>
      ))}
    </CollapseGroup>
    <CollapseGroup
      title="Scratch Orgs"
      isOpen={props.scratchExpanded}
      onToggleOpen={() => props.toggleExpansion("scratchOrgs")}
    >
      {props.scratchOrgList.map((org) => (
        <OrgItem key={org.description.username} org={org} />
      ))}
    </CollapseGroup>
  </div>
));
