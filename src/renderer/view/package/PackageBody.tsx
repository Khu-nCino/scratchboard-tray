import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { NonIdealState, Spinner, Button, Checkbox, HTMLSelect } from "@blueprintjs/core";
import { ScratchBoardState } from "renderer/store";
import { selectOrg } from "renderer/store/orgs";
import { PackageDetail } from "./PackageDetail";
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";
import { InstallConfirmationAlert } from "./InstallConfirmationAlert";
import { notUndefined } from "common/util";
import { UpgradeCheckbox } from "./UpgradeCheckbox";
import {
  checkInstalledPackages,
  togglePendingPackageUpgrade,
  toggleAllPendingPackageUpgrade,
  setOrgTargetType,
  installPackages,
} from "renderer/store/packages/actions";
import {
  TargetType,
  OrgActionStatus,
  targetTypes,
  OrgPackageState,
  defaultOrgPackageState,
} from "renderer/store/packages/state";
import { compareVersions } from "renderer/api/core/util";

import "./PackageBody.scss";
import { OrgListRefresh } from "./OrgListRefresh";
import { UpgradeTracker } from "./UpgradeTracker";

function mapStateToProps(state: ScratchBoardState) {
  const { detailUsername } = state.route;

  if (detailUsername === undefined) {
    throw new Error("Detail username can't be undefined on the Packages route.");
  }

  const orgPackageDetails: OrgPackageState =
    state.packages.orgInfo[detailUsername] ?? defaultOrgPackageState;

  return {
    detailUsername,
    orgPackageDetails,
    authorityExists: selectOrg(state, state.packages.authorityUsername) !== undefined,
  };
}

const mapDispatchToProps = {
  checkInstalledPackages,
  togglePendingPackageUpgrade,
  toggleAllPendingPackageUpgrade,
  setOrgTargetType,
  installPackages,
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
    if (props.authorityExists && props.orgPackageDetails.actionStatus === "initial") {
      props.checkInstalledPackages(props.detailUsername);
    }
  }, [props.authorityExists, props.orgPackageDetails.actionStatus]);

  const [selectedVersion, setSelectedVersion] = useState<AuthorityPackageVersion | undefined>();

  const [selectedVersionOpened, setSelectedVersionOpened] = useState(false);
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

  const { installRequest } = props.orgPackageDetails;
  const upgradeInProgress = installRequest?.status === "pending";

  const mappedPackageEntities = packageEntities.map(
    ([packageId, { targets, isManaged, upgradeSelected }]) => {
      const installedVersionInfo = targets.installed;
      const targetVersionInfo = targets[props.orgPackageDetails.target] ?? installedVersionInfo;

      const versionCompare = compareVersions(
        installedVersionInfo?.versionName,
        targetVersionInfo?.versionName
      );

      return {
        packageId,
        installedVersionInfo,
        targetVersionInfo,
        isManaged,
        upgradeSelected,
        upgradeAvailable: versionCompare === -1,
        sameVersion: versionCompare === 0,
      };
    }
  );

  const upgradeableInstalledPackages = mappedPackageEntities.filter(
    ({ upgradeAvailable, isManaged }) => isManaged && upgradeAvailable
  );
  const markedForUpgrade = upgradeableInstalledPackages
    .filter(({ upgradeSelected }) => upgradeSelected)
    .map(({ targetVersionInfo }) => targetVersionInfo)
    .filter(notUndefined);
  const allChecked =
    upgradeableInstalledPackages.length > 0 &&
    upgradeableInstalledPackages.length === markedForUpgrade.length;
  const anyChecked = markedForUpgrade.length > 0;

  return (
    <>
      <div style={{ overflow: "hidden auto", flexGrow: 1 }}>
        <div className="sbt-package-grid">
          <h4 className="sbt-header-item">Name</h4>
          <h4 className="sbt-header-item sbt-ml_x-small">Current</h4>
          <HTMLSelect
            className="sbt-header-item"
            minimal
            options={(targetTypes as unknown) as string[]} // options isn't marked as readonly so we need to do an unsafe cast.
            disabled={upgradeInProgress}
            value={props.orgPackageDetails.target}
            onChange={(event) => {
              props.setOrgTargetType(props.detailUsername, event.target.value as TargetType);
            }}
          />
          <Checkbox
            className="sbt-header-item sbt-package-upgrade-checkbox"
            indeterminate={anyChecked && !allChecked}
            disabled={upgradeableInstalledPackages.length === 0 || upgradeInProgress}
            checked={allChecked}
            onChange={() => props.toggleAllPendingPackageUpgrade(props.detailUsername)}
          />
          {mappedPackageEntities.flatMap(
            ({
              packageId,
              installedVersionInfo,
              upgradeAvailable,
              targetVersionInfo,
              sameVersion,
              upgradeSelected,
              isManaged,
            }) => {
              return [
                <span key={`namespace-${packageId}`} className="sbt-first-column">
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
                  disabled={sameVersion}
                  onClick={() => {
                    setSelectedVersion(targetVersionInfo);
                    setSelectedVersionOpened(true);
                  }}
                >
                  {targetVersionInfo?.versionName}
                </Button>,
                <UpgradeCheckbox
                  key={`check-${packageId}`}
                  managed={isManaged}
                  disabled={!upgradeAvailable || upgradeInProgress}
                  checked={upgradeSelected && upgradeAvailable}
                  onToggle={() => {
                    props.togglePendingPackageUpgrade(props.detailUsername, packageId);
                  }}
                />,
              ];
            }
          )}
        </div>
      </div>
      <div className="sbt-footer-container sbt-flex-container">
        {!upgradeInProgress && (
          <OrgListRefresh
            versionsCheckedTimestamp={props.orgPackageDetails.versionsCheckedTimestamp}
            upgradeInProgress={upgradeInProgress}
            onClick={() => {
              props.checkInstalledPackages(props.detailUsername);
            }}
          />
        )}
        {upgradeInProgress && installRequest && (
          <UpgradeTracker
            startTime={installRequest.timestamp}
            progress={installRequest.progress}
            totalPackages={installRequest.totalPackages}
          />
        )}
        <Button
          intent="primary"
          className="sbt-flex-item--right sbt-m_medium"
          disabled={!anyChecked}
          loading={upgradeInProgress}
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
        targetType={props.orgPackageDetails.target}
        aliasOrUsername={props.detailUsername}
        targets={markedForUpgrade}
        onConfirm={() => {
          setShowInstallConformation(false);
          props.installPackages(props.detailUsername, markedForUpgrade);
        }}
        onCancel={() => setShowInstallConformation(false)}
      />
    </>
  );
});
