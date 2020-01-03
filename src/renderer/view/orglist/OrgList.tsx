import React from "react";

import { connect } from "react-redux";

import { State } from "../../store";
import { ScratchOrg } from "../../api/sfdx";

import OrgItem from "./OrgItem";

interface StateProps {
  orgList?: ScratchOrg[];
}

type Props = StateProps;

const rootStyle: React.CSSProperties = {
  position: "relative",
  top: "10px",
  left: "10px"
};

const itemStyle: React.CSSProperties = {
  marginBottom: "10px"
}

class OrgList extends React.Component<Props, {}> {
  renderOrgs() {
    return (
      this.props?.orgList?.map(org => <div style={itemStyle} key={org.username}><OrgItem org={org} /></div>) ?? (
        <div>Loading</div>
      )
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
