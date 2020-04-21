import React, { useEffect } from "react";

import { connect } from "react-redux";
import { Spinner, NonIdealState, Icon } from "@blueprintjs/core";

import { State } from "../../store";

import OrgItem from "./OrgItem";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { listOrgsRequest } from "../../store/orgs";

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
      if (props.orgList.length === 0) {
        return (
          <NonIdealState
            title="No Scratch Orgs Found"
            description="Please refresh when you have some."
            icon="form"
          />
        );
      } else {
        return (
          <div className="sbt-org-list">
            {props.orgList.map((org) => (
              <OrgItem key={org.username} org={org} />
            ))}
          </div>
        );
      }
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
  const displayAllOrgs = state.settings.features.displayAllOrgs;

  return {
    orgList: displayAllOrgs
      ? state.orgs.orgList
      : state.orgs.orgList.filter((org) => org.isScratchOrg),
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
