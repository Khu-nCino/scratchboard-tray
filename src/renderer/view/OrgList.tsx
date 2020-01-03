import React from "react";

import { connect } from "react-redux";
import { Button } from "@blueprintjs/core";

import { State } from "../store";
import { ScratchOrg } from "../api/sfdx";

interface StateProps {
  orgList?: ScratchOrg[];
}

type Props = StateProps;

class OrgList extends React.Component<Props, {}> {
  renderOrgs() {
      if (typeof this.props.orgList !== 'undefined') {
          return this.props.orgList.map(
            (org) => <Button>{org.alias}</Button>
          );
      } else {
          return <div>Loading</div>
      }
  }

  render() {
    return <div>{this.renderOrgs()} </div>;
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
