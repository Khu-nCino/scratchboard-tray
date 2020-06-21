import React from "react";
import { connect } from "react-redux";
import { State } from "renderer/store";

type Props = ReturnType<typeof mapStateToProps>;

function PackageBodyFun(props: Props) {
  return <div>
    <div>authorityUsername: {props.authorityUsername}</div>
    <div>orgData: {JSON.stringify(props.org)}</div>
  </div>
}

function mapStateToProps(state: State) {
  const detailUsername = state.route.detailUsername;

  return {
    authorityUsername: state.settings.packageAuthorityUsername,
    org: state.orgs.orgList.find((org) => org.description.username === detailUsername),
  }
}

export const PackageBody = connect(mapStateToProps)(PackageBodyFun);