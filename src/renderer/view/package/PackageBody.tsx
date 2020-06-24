import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { NonIdealState, Spinner, Button } from "@blueprintjs/core";
import { State } from "renderer/store";
import { checkInstalledPackagesAction, selectOrgInfo } from "renderer/store/packages";

function mapStateToProps(state: State) {
  const detailUsername = state.route.detailUsername;
  
  if (detailUsername === undefined) {
    throw new Error("Detail username can't be undefined on the Packages route.");
  }

  const orgInfo = selectOrgInfo(state, detailUsername);

  return {
    detailUsername,
    authorityUsername: state.packages.authorityUsername,
    actionStatus: orgInfo.actionStatus,
    installedVersions: orgInfo.installedVersions,
  };
}

const mapDispatchToProps = {
  checkInstalledPackagesAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

function PackageBodyFun(props: PropsFromRedux) {
  if (props.actionStatus === 'pending') {
    return <NonIdealState icon={<Spinner />} title="Loading Package Information" />
  }

  return <div>
    <Button onClick={() => props.checkInstalledPackagesAction(props.detailUsername)}>Reload</Button>
    <div>authorityUsername: {props.authorityUsername}</div>
    {props.installedVersions.map((version) => <div key={version.namespace}>
      Namespace: {version.namespace}, Version: {version.version}
    </div>)}
  </div>
}

export const PackageBody = connector(PackageBodyFun);