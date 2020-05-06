import React, { useEffect } from "react";

import { connect } from "react-redux";
import { Spinner, NonIdealState, Icon } from "@blueprintjs/core";

import { State, CustomDispatch } from "renderer/store";
import { listOrgsRequest, selectSharedOrgs, selectScratchOrgs } from "renderer/store/orgs";
import { toggleExpansion } from "renderer/store/expanded";
import OrgItem from "./OrgItem";
import CollapseGroup from "../CollapseGroup";
import { pushRouteAction } from "renderer/store/route";

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function OrgList(props: Props) {
  useEffect(() => {
    if (
      (props.orgListStatus === "initial" && props.isSfdxPathValid !== undefined) ||
      (props.orgListStatus === "invalid_sfdx_path" && props.isSfdxPathValid)
    ) {
      props.requestOrgList();
    }
  }, [props.isSfdxPathValid]);

  switch (props.orgListStatus) {
    case "loaded":
      return (
        <div className="sbt-org-list">
          <CollapseGroup
            title="Shared Orgs"
            auxButtonIcon="log-in"
            isOpen={props.standardExpanded}
            onToggleOpen={props.toggleSharedExpand}
            onAuxButtonClick={props.viewLoginRoute}
          >
            {props.sharedOrgList.map((org) => (
              <OrgItem key={org.description.username} org={org}></OrgItem>
            ))}
          </CollapseGroup>
          <CollapseGroup
            title="Scratch Orgs"
            isOpen={props.scratchExpanded}
            onToggleOpen={props.toggleScratchExpand}
          >
            {props.scratchOrgList.map((org) => (
              <OrgItem key={org.description.username} org={org} />
            ))}
          </CollapseGroup>
        </div>
      );
    case "initial":
      return <></>;
    case "pending":
      return (
        <NonIdealState>
          <Spinner />
        </NonIdealState>
      );
    case "failed":
      return (
        <NonIdealState
          title="Don't Panic!😱"
          description={
            <>
              An error occurred.
              <br />
              Notify a developer to help improve this software.
            </>
          }
        />
      );
    case "invalid_sfdx_path":
      return (
        <NonIdealState
          title="Just a Little Config"
          description={
            <>
              No SFDX binary found.
              <br />
              Try setting the path in the <Icon icon="cog" /> screen and coming back.
            </>
          }
        />
      );
    default:
      return <div>You shouldn't be seeing this message</div>;
  }
}

function mapStateToProps(state: State) {
  return {
    scratchOrgList: selectScratchOrgs(state.orgs),
    sharedOrgList: selectSharedOrgs(state.orgs),
    orgListStatus: state.orgs.orgListStatus,
    isSfdxPathValid: state.settings.isSfdxPathValid,
    standardExpanded: state.expanded.sharedOrgs,
    scratchExpanded: state.expanded.scratchOrgs,
  };
}

function mapDispatchToProps(dispatch: CustomDispatch) {
  return {
    viewLoginRoute: () => dispatch(pushRouteAction("login")),
    requestOrgList: () => dispatch(listOrgsRequest()),
    toggleSharedExpand: () => dispatch(toggleExpansion("sharedOrgs")),
    toggleScratchExpand: () => dispatch(toggleExpansion("scratchOrgs")),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgList);
