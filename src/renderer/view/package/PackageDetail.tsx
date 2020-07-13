import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { shell } from "electron";
import { Dialog, Classes, Button } from "@blueprintjs/core";

import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";
import { orgManager } from "renderer/api/core/OrgManager";
import { State } from "renderer/store";
import { createErrorToast } from "renderer/store/messages";

function mapStateToProps(state: State) {
  const {
    route: { detailUsername },
  } = state;
  return {
    detailUsername,
  };
}

const mapDispatchToProps = {
  createErrorToast,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

interface Props extends ConnectedProps<typeof connector> {
  packageVersion?: AuthorityPackageVersion;
  isOpenable: boolean;
  onClose?: () => void;
}

export const PackageDetail = connector((props: Props) => {
  const [isOpeningFrontDoor, setIsOpeningFrontDoor] = useState(false);

  return (
    <Dialog
      isOpen={props.packageVersion !== undefined}
      onClose={props.onClose}
      className="sbt-mh_medium"
    >
      <div className={Classes.DIALOG_BODY}>
        <div>Namespace: {props.packageVersion?.namespace}</div>
        <div>Version: {props.packageVersion?.versionName}</div>
        <div>BuildDate: {props.packageVersion?.buildDate}</div>
        <div>PackageId: {props.packageVersion?.packageId}</div>
        <div>Password: {props.packageVersion?.password}</div>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          {props.isOpenable && <Button
            loading={isOpeningFrontDoor}
            onClick={async () => {
              if (props.detailUsername === undefined) {
                return;
              }

              try {
                setIsOpeningFrontDoor(true);
                shell.openExternal(
                  await orgManager.getFrontDoor(
                    props.detailUsername,
                    `/packaging/installPackage.apexp?p0=${props.packageVersion?.packageId}`
                  )
                );
              } catch (error) {
                props.createErrorToast("", error);
              } finally {
                setIsOpeningFrontDoor(false);
              }
            }}
          >
            Open Install URL
          </Button>}
          <Button onClick={props.onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
});
