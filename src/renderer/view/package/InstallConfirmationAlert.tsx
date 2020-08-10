import React from "react";
import { Alert } from "@blueprintjs/core";
import { AuthorityPackageVersion } from "renderer/api/core/PackageManager";

interface Props {
  isOpen: boolean;
  aliasOrUsername: string;
  targetType: string;
  targets: AuthorityPackageVersion[];
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const InstallConfirmationAlert = (props: Props) => (
  <Alert
    isOpen={props.isOpen}
    onConfirm={props.onConfirm}
    onCancel={props.onCancel}
    className="sbt-popover"
    cancelButtonText="Cancel"
    confirmButtonText="Upgrade"
    intent="primary"
  >
    <b>Org:</b> {props.aliasOrUsername}<br/>
    <b>Target:</b> {props.targetType}<br/>
    <b>Packages:</b> {props.targets.map((target) => target.namespace).join(", ")}<br/><br/>
    Please verify that all of the above information is correct before continuing. This process cannot be undone.
  </Alert>
);
