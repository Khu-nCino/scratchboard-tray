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
  height: "100%"
};

const spinnerStyle: React.CSSProperties = {
  margin: "50% auto"
};

class OrgList extends React.Component<Props, {}> {
  renderOrgs() {
    return (
      this.props?.orgList?.map(org => (
        <div key={org.username}>
          <OrgItem org={org} />
        </div>
      )) ?? this.renderLoadingState()
    );
  }

  renderLoadingState() {
    return (
      <div style={spinnerStyle}>
        <Spinner />
      </div>
    );
  }

  render() {
    return <div style={rootStyle}>{this.renderOrgs()}</div>;
  }
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
