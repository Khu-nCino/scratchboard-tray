import React, { useEffect } from "react";

import { connect } from "react-redux";
import { Spinner, NonIdealState, Icon } from "@blueprintjs/core";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { State } from "renderer/store";
import { listOrgsRequest } from "renderer/store/orgs";
import { toggleExpansion } from "renderer/store/expanded";
import OrgItem from "./OrgItem";
import CollapseGroup from "../CollapseGroup";
import { NonScratchOrg, ScratchOrg } from "renderer/api/sfdx";

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function OrgList(props: Props) {
  useEffect(() => {
    if (
      (props.orgListStatus === "initial" &&
        props.isSfdxPathValid !== undefined) ||
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
            onToggleOpen={props.toggleStandardExpand}
          >
            {props.standardOrgList.map((org) => (
              <OrgItem key={org.username} org={org}></OrgItem>
            ))}
          </CollapseGroup>
          <CollapseGroup
            title="Scratch Orgs"
            isOpen={props.scratchExpanded}
            onToggleOpen={props.toggleScratchExpand}
          >
            {props.scratchOrgList.map((org) => (
              <OrgItem key={org.username} org={org} />
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
              Try setting the path in the <Icon icon="cog" /> screen and coming
              back.
            </>
          }
        />
      );
    default:
      return <div>You shouldn't be seeing this message</div>;
  }
}

function mapStateToProps(state: State) {
  const scratchOrgList: ScratchOrg[] = [];
  const standardOrgList: NonScratchOrg[] = [];

  state.orgs.orgList.forEach((org) => {
    if (org.isScratchOrg) {
      scratchOrgList.push(org);
    } else {
      standardOrgList.push(org);
    }
  });

  return {
    scratchOrgList,
    standardOrgList,
    orgListStatus: state.orgs.orgListStatus,
    isSfdxPathValid: state.settings.isSfdxPathValid,
    standardExpanded: state.expanded.standardOrgs,
    scratchExpanded: state.expanded.scratchOrgs,
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<State, undefined, AnyAction>
) {
  return {
    requestOrgList: () => dispatch(listOrgsRequest()),
    toggleStandardExpand: () => dispatch(toggleExpansion('standardOrgs')),
    toggleScratchExpand: () => dispatch(toggleExpansion('scratchOrgs')),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgList);
