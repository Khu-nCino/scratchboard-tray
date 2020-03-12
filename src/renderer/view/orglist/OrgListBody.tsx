import React, { ReactNode, useEffect } from "react";

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

const rootStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflowY: "scroll"
};

function Centered(props: { children: ReactNode }) {
  return <div className="sbt-centered" >
    {props.children}
  </div>
}

function OrgList(props: Props) {
  useEffect(() => {
    if ((props.orgListStatus === 'invalid_sfdx_path' || props.orgListStatus === 'initial') && props.isSfdxPathValid !== undefined) {
      props.requestOrgList();
    }
  }, [props.isSfdxPathValid]);

  switch (props.orgListStatus) {
    case "loaded":
      if (props.orgList.length === 0) {
        return <Centered>
            <NonIdealState title="No Scratch Orgs Found" description="Please refresh when you have some." icon="form" />
          </Centered>;
      } else {
        return (
          <div style={rootStyle}>
            {props.orgList.map(org => (
              <OrgItem key={org.username} org={org} />
            ))}
          </div>
        );
      }
    case "initial": // This is a little scary. Let's hope it dose not load for every.
    case "pending":
      return <Centered><Spinner /></Centered>;
    case "failed":
      return <Centered>
        <NonIdealState title="Don't Panic!😱" description={<>An error occurred.<br/>Notify a developer to help improve this software.</>}/>
      </Centered>;
    case "invalid_sfdx_path":
      return <Centered>
        <NonIdealState title="Just a Little Config" description={<>No SFDX binary found.<br/>Try setting the path in the <Icon icon="cog" /> screen and coming back.</>} />
      </Centered>;
    default:
      return <div>You shouldn't be seeing this message</div>;
  }
}

function mapStateToProps(state: State) {
  return {
    orgList: state.orgs.orgList,
    orgListStatus: state.orgs.orgListStatus,
    isSfdxPathValid: state.settings.isSfdxPathValid
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, undefined, AnyAction>) {
  return {
    requestOrgList: () => dispatch(listOrgsRequest())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgList);
