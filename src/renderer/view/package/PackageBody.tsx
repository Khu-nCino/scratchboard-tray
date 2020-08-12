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
  installPackages,
} from "renderer/store/packages";
import "./PackageBody.scss";
import { selectOrg } from "renderer/store/orgs";
import { PackageDetail } from "./PackageDetail";
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";
import { InstallConfirmationAlert } from "./InstallConfirmationAlert";
import { notUndefined } from "common/util";

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
  installPackages,
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

const targetTypes = ["Latest", "Patch"] as const;
type TargetType = typeof targetTypes[number];

export const PackageBody = connector((props: Props) => {
  useEffect(() => {
    if (props.authorityExists && props.orgPackageDetails.actionStatus === "initial") {
      props.checkInstalledPackages(props.detailUsername);
    }
  }, [props.orgPackageDetails.actionStatus]);

  const [selectedVersion, setSelectedVersion] = useState<AuthorityPackageVersion | undefined>();
  const [selectedVersionOpened, setSelectedVersionOpened] = useState(false);
  const [targetType, setTargetType] = useState<TargetType>("Latest");
  const [showInstallConformation, setShowInstallConformation] = useState(false);

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

  const upgradeableInstalledPackages = Object.values(props.orgPackageDetails.packages).filter(
    ({ upgradeAvailable }) => upgradeAvailable
  );
  const markedForUpgrade = upgradeableInstalledPackages
    .filter(({ upgradeSelected }) => upgradeSelected)
    .map(({ latestVersionInfo }) => latestVersionInfo)
    .filter(notUndefined);
  const allChecked = upgradeableInstalledPackages.length === markedForUpgrade.length;
  const anyChecked = markedForUpgrade.length > 0;

  const anyPendingInstall = Object.values(props.orgPackageDetails.packages).some(
    ({ pendingInstall }) => pendingInstall
  );

  return (
    <div style={{ overflow: "hidden auto" }}>
      <div className="sbt-package-grid">
        <h4 className="sbt-header-item">Name</h4>
        <h4 className="sbt-header-item sbt-ml_x-small">Current</h4>
        <HTMLSelect
          className="sbt-header-item"
          minimal
          options={(targetTypes as unknown) as string[]} // options isn't marked as readonly so we need to do an unsafe cast.
          value={targetType}
          onChange={(event) => {
            setTargetType(event.target.value as TargetType);
          }}
        />
        {upgradeableInstalledPackages.length > 0 && (
          <Checkbox
            className="sbt-header-item sbt-package-upgrade-checkbox"
            indeterminate={anyChecked && !allChecked}
            disabled={anyPendingInstall}
            checked={allChecked}
            onChange={() => props.toggleAllPendingPackageUpgrade(props.detailUsername)}
          />
        )}
        {packageEntities.flatMap(
          ([
            packageId,
            {
              installedVersionInfo,
              upgradeAvailable,
              latestVersionInfo,
              upgradeSelected,
              pendingInstall,
            },
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
                  setSelectedVersionOpened(false);
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
                  setSelectedVersionOpened(true);
                }}
              >
                {latestVersionInfo?.versionName}
              </Button>,
              pendingInstall ? (
                <Spinner key={`spinner-${packageId}`} size={15} />
              ) : (
                upgradeAvailable && (
                  <Checkbox
                    key={`check-${packageId}`}
                    checked={upgradeSelected && upgradeAvailable}
                    disabled={anyPendingInstall}
                    onChange={() => {
                      props.togglePendingPackageUpgrade(props.detailUsername, packageId);
                    }}
                    className="sbt-package-upgrade-checkbox"
                  />
                )
              ),
            ];
          }
        )}
      </div>
      <div className="sbt-flex-container">
        <span className="sbt-ml_medium sbt-mv_medium">
          {`checked on: ${new Date(
            props.orgPackageDetails.lastInstalledVersionsChecked!!
          ).toDateString()}`}
        </span>
        <Button
          className="sbt-ml_none sbt-mv_medium"
          minimal
          icon="refresh"
          disabled={anyPendingInstall}
          onClick={() => {
            props.checkInstalledPackages(props.detailUsername);
          }}
        />
        <Button
          intent="primary"
          className="sbt-flex-item--right sbt-m_medium"
          disabled={!anyChecked}
          loading={anyPendingInstall}
          onClick={() => setShowInstallConformation(true)}
        >
          Upgrade
        </Button>
      </div>
      <PackageDetail
        packageVersion={selectedVersion}
        isOpenable={selectedVersionOpened}
        onClose={() => setSelectedVersion(undefined)}
      />
      <InstallConfirmationAlert
        isOpen={showInstallConformation}
        targetType={targetType}
        aliasOrUsername={props.detailUsername}
        targets={markedForUpgrade}
        onConfirm={() => {
          setShowInstallConformation(false);
          props.installPackages(props.detailUsername, markedForUpgrade);
        }}
        onCancel={() => setShowInstallConformation(false)}
      />
    </div>
  );
});
