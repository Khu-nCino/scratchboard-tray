import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { NonIdealState, Spinner, Button, Checkbox } from "@blueprintjs/core";
import { State } from "renderer/store";
import {
  checkInstalledPackages,
  selectOrgInfo,
  selectLatestPackageVersions,
  OrgActionStatus,
  togglePendingPackageUpgrade,
  toggleAllPendingPackageUpgrade,
} from "renderer/store/packages";
import "./PackageBody.scss";

function mapStateToProps(state: State) {
  const { detailUsername } = state.route;

  if (detailUsername === undefined) {
    throw new Error("Detail username can't be undefined on the Packages route.");
  }

  const orgInfo = selectOrgInfo(state, detailUsername);
  const { actionStatus, packages } = orgInfo;

  const latestVersions = selectLatestPackageVersions(state, Object.keys(packages));
  const installedPackages = Object.entries(packages).map(([namespace, info]) => {
    const latestVersion = latestVersions[namespace]?.versionName;
    return {
      ...info,
      namespace,
      latestVersion,
      upgradeAvailable: latestVersions !== undefined && info.installedVersion !== latestVersion,
    };
  });

  const { authorityUsername } = state.packages;

  return {
    detailUsername,
    authorityUsername,
    actionStatus,
    installedPackages,
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
    if (props.actionStatus === "initial") {
      props.checkInstalledPackages(props.detailUsername);
    }
  }, [props.actionStatus]);

  if (props.actionStatus.startsWith("pending")) {
    return (
      <NonIdealState
        icon={<Spinner />}
        title={getLoadingMessage(props.actionStatus)}
        description="This may take a while."
      />
    );
  }

  const upgradeableInstalledPackages = props.installedPackages.filter(
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
        {props.installedPackages.flatMap(
          ({ namespace, installedVersion, pendingUpgrade, upgradeAvailable, latestVersion }) => {
            return [
              <span key={`namespace-${namespace}`} style={{ gridColumn: 1 }}>
                {namespace}
              </span>,
              <span key={`currentVersion-${namespace}`}>{installedVersion}</span>,
              <span key={`latestVersion-${namespace}`}>{latestVersion}</span>,
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
