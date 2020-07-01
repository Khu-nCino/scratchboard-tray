import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { NonIdealState, Spinner, Button, Checkbox } from "@blueprintjs/core";
import { State } from "renderer/store";
import {
  checkInstalledPackages,
  selectOrgInfo,
  selectLatestPackageVersions,
  OrgActionStatus,
} from "renderer/store/packages";
import "./PackageBody.scss";

function mapStateToProps(state: State) {
  const { detailUsername } = state.route;

  if (detailUsername === undefined) {
    throw new Error("Detail username can't be undefined on the Packages route.");
  }

  const orgInfo = selectOrgInfo(state, detailUsername);
  const namespaces = orgInfo?.installedVersions.map((org) => org.namespace) ?? [];
  const latestVersions = selectLatestPackageVersions(state, namespaces);

  const { authorityUsername } = state.packages;
  const { actionStatus, installedVersions } = orgInfo;

  return {
    detailUsername,
    authorityUsername,
    actionStatus,
    installedVersions,
    latestVersions,
  };
}

const mapDispatchToProps = {
  checkInstalledPackages,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

function getLoadingMessage(status: OrgActionStatus) {
  switch (status) {
    case "pending_subscriber":
      return "Retrieving installed packages";
    case "pending_authority":
      return "Retrieving latest package versions";
    case "pending_details":
      return "Retrieving package details";
    default:
      return "Invalid state";
  }
}

export const PackageBody = connector((props: Props) => {
  useEffect(() => {
    if (props.actionStatus === "initial") {
      props.checkInstalledPackages(props.detailUsername);
    }
  }, [props.actionStatus]);

  if (props.actionStatus.startsWith("pending")) {
    return <NonIdealState icon={<Spinner />} title={getLoadingMessage(props.actionStatus)} />;
  }

  return (
    <div>
      <div className="sbt-package-grid">
        <h4 className="sbt-header-item">Namespace</h4>
        <h4 className="sbt-header-item">Current</h4>
        <h4 className="sbt-header-item">Latest</h4>
        <Checkbox className="sbt-header-item sbt-package-upgrade-checkbox" />
        {props.installedVersions.flatMap((version) => [
          <span key={`namespace-${version.namespace}`}>{version.namespace}</span>,
          <span key={`currentVersion-${version.namespace}`}>{version.versionName}</span>,
          <span key={`latestVersion-${version.namespace}`}>
            {props.latestVersions[version.namespace]?.versionName}
          </span>,
          <Checkbox key={`check-${version.namespace}`} className="sbt-package-upgrade-checkbox" />,
        ])}
      </div>
      <Button
        intent="primary"
        style={{ float: "right" }}
        className="sbt-m_medium"
      >
        Upgrade
      </Button>
    </div>
  );
});
