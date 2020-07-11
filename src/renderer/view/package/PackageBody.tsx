import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { NonIdealState, Spinner, Button, Checkbox } from "@blueprintjs/core";
import { State } from "renderer/store";
import {
  checkInstalledPackages,
  OrgActionStatus,
  togglePendingPackageUpgrade,
  toggleAllPendingPackageUpgrade,
  selectOrgPackageDetails,
} from "renderer/store/packages";
import "./PackageBody.scss";
import { selectOrg } from "renderer/store/orgs";

function mapStateToProps(state: State) {
  const { detailUsername } = state.route;

  if (detailUsername === undefined) {
    throw new Error("Detail username can't be undefined on the Packages route.");
  }

  const orgPackageDetails = selectOrgPackageDetails(state.packages, detailUsername);

  return {
    detailUsername,
    authorityExists: selectOrg(state.orgs, state.packages.authorityUsername) !== undefined,
    orgPackageDetails,
  };
}

const mapDispatchToProps = {
  checkInstalledPackages,
  togglePendingPackageUpgrade,
  toggleAllPendingPackageUpgrade,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

function getLoadingMessage(status: OrgActionStatus) {
  switch (status) {
    case "pending_subscriber":
      return "Retrieving installed packages (1/3)";
    case "pending_authority":
      return "Retrieving latest package versions (2/3)";
    case "pending_details":
      return "Retrieving package details (3/3)";
    default:
      return "Invalid state";
  }
}

export const PackageBody = connector((props: Props) => {
  useEffect(() => {
    if (props.authorityExists && props.orgPackageDetails.actionStatus === "initial") {
      props.checkInstalledPackages(props.detailUsername);
    }
  }, [props.orgPackageDetails.actionStatus]);

  if (!props.authorityExists) {
    return <NonIdealState icon="error" title="Package authority not found. Please check the settings page." />
  }

  if (props.orgPackageDetails.actionStatus.startsWith("pending")) {
    return (
      <NonIdealState
        icon={<Spinner />}
        title={getLoadingMessage(props.orgPackageDetails.actionStatus)}
        description="This may take a while."
      />
    );
  }

  const upgradeableInstalledPackages = Object.values(props.orgPackageDetails.packages).filter(
    ({ upgradeAvailable }) => upgradeAvailable
  );
  let allChecked = upgradeableInstalledPackages.every(({ pendingUpgrade }) => pendingUpgrade);
  let anyChecked = upgradeableInstalledPackages.some(({ pendingUpgrade }) => pendingUpgrade);

  return (
    <div>
      <div className="sbt-package-grid">
        <h4 className="sbt-header-item">Namespace</h4>
        <h4 className="sbt-header-item">Current</h4>
        <h4 className="sbt-header-item">Latest</h4>
        <Checkbox
          className="sbt-header-item sbt-package-upgrade-checkbox"
          indeterminate={anyChecked && !allChecked}
          checked={allChecked}
          onChange={() => props.toggleAllPendingPackageUpgrade(props.detailUsername)}
        />
        {Object.entries(props.orgPackageDetails.packages).flatMap(
          ([namespace, { installedVersionInfo, pendingUpgrade, upgradeAvailable, latestVersionInfo }]) => {
            return [
              <span key={`namespace-${namespace}`} style={{ gridColumn: 1 }}>
                {namespace}
              </span>,
              <Button small minimal key={`currentVersion-${namespace}`}>{installedVersionInfo.versionName}</Button>,
              <Button small minimal key={`latestVersion-${namespace}`}>{latestVersionInfo.versionName}</Button>,
              upgradeAvailable && (
                <Checkbox
                  key={`check-${namespace}`}
                  checked={pendingUpgrade && upgradeAvailable}
                  onChange={() => {
                    props.togglePendingPackageUpgrade(props.detailUsername, namespace);
                  }}
                  className="sbt-package-upgrade-checkbox"
                />
              ),
            ];
          }
        )}
      </div>
      <Button intent="primary" style={{ float: "right" }} className="sbt-m_medium">
        Upgrade
      </Button>
    </div>
  );
});
