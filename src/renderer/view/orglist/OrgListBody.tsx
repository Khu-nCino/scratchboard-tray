import React, { useEffect, useState } from "react";

import { connect } from "react-redux";
import { Spinner, NonIdealState, Icon } from "@blueprintjs/core";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

import { State } from "../../store";
import { listOrgsRequest } from "../../store/orgs";
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

  const [standardOpen, setStandardOpen] = useState(false);
  const [scratchOpen, setScratchOpen] = useState(true);

  switch (props.orgListStatus) {
    case "loaded":
      return (
        <div className="sbt-org-list">
          <CollapseGroup 
            title="Standard Orgs"
            showPlusButton
            isOpen={standardOpen}
            onToggleOpen={() => {
              setStandardOpen(!standardOpen);
            }}
          >
            {props.standardOrgList.map((org) => (
              <OrgItem key={org.username} org={org}></OrgItem>
            ))}
          </CollapseGroup>
          <CollapseGroup
            title="Scratch Orgs"
            isOpen={scratchOpen}
            onToggleOpen={() => {
              setScratchOpen(!scratchOpen);
            }}
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
  };
}

function mapDispatchToProps(
  dispatch: ThunkDispatch<State, undefined, AnyAction>
) {
  return {
    requestOrgList: () => dispatch(listOrgsRequest()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgList);
