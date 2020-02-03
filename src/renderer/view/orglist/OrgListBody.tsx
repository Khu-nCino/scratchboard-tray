import React from "react";

import { connect } from "react-redux";
import { Spinner } from "@blueprintjs/core";

import { State } from "../../store";
import { ScratchOrg } from "../../api/sfdx";

import OrgItem from "./OrgItem";

interface StateProps {
  orgList?: ScratchOrg[];
}

type Props = StateProps;

const rootStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflowY: "scroll"
};

const spinnerStyle: React.CSSProperties = {
  margin: "50% auto"
};

function LoadingState() {
  return (
    <div style={spinnerStyle}>
      <Spinner />
    </div>
  );
}

function OrgList(props: Props) {
  return <div style={rootStyle}>{
    props?.orgList?.map(org =>
      <div key={org.username}>
        <OrgItem org={org} />
      </div>
    ) ?? <LoadingState />
  }</div>;
}

function mapStateToProps(state: State): StateProps {
  if (state.orgs.type === "FULFILLED") {
    return {
      orgList: state.orgs.orgList
    };
  }

  return {};
}

export default connect<StateProps, {}, {}, State>(mapStateToProps)(OrgList);
