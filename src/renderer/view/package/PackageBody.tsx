import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { NonIdealState, Spinner, Button, Checkbox, HTMLSelect } from "@blueprintjs/core";
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
import { PackageDetail } from "./PackageDetail";
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";

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

  const [selectedVersion, setSelectedVersion] = useState<AuthorityPackageVersion | undefined>();
  const [selectedVersionOpenable, setSelectedVersionOpenable] = useState(false);

  if (!props.authorityExists) {
    return <NonIdealState icon="error" title="No package authority set." />;
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

  const packageEntities = Object.entries(props.orgPackageDetails.packages);

  const upgradeableInstalledPackages = Object.values(props.orgPackageDetails.packages).filter(
    ({ upgradeAvailable }) => upgradeAvailable
  );
  let allChecked = upgradeableInstalledPackages.every(({ upgradeSelected }) => upgradeSelected);
  let anyChecked = upgradeableInstalledPackages.some(({ upgradeSelected }) => upgradeSelected);

  if (packageEntities.length === 0) {
    return (
      <NonIdealState
        title="No packages found."
        action={
          <Button
            icon="refresh"
            onClick={() => {
              props.checkInstalledPackages(props.detailUsername);
            }}
          >
            Refresh
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ overflow: "hidden auto" }}>
      <div className="sbt-flex-container">
        <Button intent="primary" className="sbt-m_small sbt-mb_none">
          Upgrade
        </Button>
        <span className="sbt-flex-item--right sbt-m_small sbt-mb_none">
          {`checked on: ${new Date(
            props.orgPackageDetails.lastInstalledVersionsChecked!!
          ).toDateString()}`}
        </span>
        <Button
          className="sbt-m_small sbt-mb_none"
          minimal
          icon="refresh"
          onClick={() => {
            props.checkInstalledPackages(props.detailUsername);
          }}
        />
      </div>
      <div className="sbt-package-grid">
        <h4 className="sbt-header-item">Name</h4>
        <h4 className="sbt-header-item sbt-ml_x-small">Current</h4>
        <HTMLSelect className="sbt-header-item" minimal options={["Latest", "Patch", "Release"]} />
        <Checkbox
          className="sbt-header-item sbt-package-upgrade-checkbox"
          indeterminate={anyChecked && !allChecked}
          checked={allChecked}
          onChange={() => props.toggleAllPendingPackageUpgrade(props.detailUsername)}
        />
        {packageEntities.flatMap(
          ([
            packageId,
            { installedVersionInfo, upgradeAvailable, latestVersionInfo, upgradeSelected },
          ]) => {
            return [
              <span key={`namespace-${packageId}`} style={{ gridColumn: 1 }}>
                {installedVersionInfo?.namespace ?? installedVersionInfo?.packageName}
              </span>,
              <Button
                small
                fill
                minimal
                alignText="left"
                key={`currentVersion-${packageId}`}
                onClick={() => {
                  setSelectedVersion(installedVersionInfo);
                  setSelectedVersionOpenable(false);
                }}
              >
                {installedVersionInfo?.versionName}
              </Button>,
              <Button
                small
                fill
                minimal
                alignText="left"
                key={`latestVersion-${packageId}`}
                disabled={!upgradeAvailable}
                onClick={() => {
                  setSelectedVersion(latestVersionInfo);
                  setSelectedVersionOpenable(true);
                }}
              >
                {latestVersionInfo?.versionName}
              </Button>,
              upgradeAvailable && (
                <Checkbox
                  key={`check-${packageId}`}
                  checked={upgradeSelected && upgradeAvailable}
                  onChange={() => {
                    props.togglePendingPackageUpgrade(props.detailUsername, packageId);
                  }}
                  className="sbt-package-upgrade-checkbox"
                />
              ),
            ];
          }
        )}
      </div>
      <PackageDetail
        packageVersion={selectedVersion}
        isOpenable={selectedVersionOpenable}
        onClose={() => setSelectedVersion(undefined)}
      />
    </div>
  );
});
