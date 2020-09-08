import React from "react";
import { Checkbox, Icon, Spinner, Tooltip } from "@blueprintjs/core";

interface Props {
  checked: boolean;
  onToggle: () => void;
  managed: boolean;
  disabled: boolean;
  installStatus: "pending" | "success" | "error" | "idle";
}

export const UpgradeCheckbox = (props: Props) => {
  if (props.installStatus === "pending") {
    return <Spinner size={15} />;
  } else if (props.installStatus === "success") {
    return (
      <Tooltip content="Install Success" position="left" className="sbt-package-upgrade-checkbox">
        <Icon iconSize={15} icon="tick-circle" intent="success" />
      </Tooltip>
    );
  } else if (props.installStatus === "error") {
    return (
      <Tooltip content="Install Error" position="left" className="sbt-package-upgrade-checkbox">
        <Icon iconSize={15} icon="warning-sign" intent="danger" />
      </Tooltip>
    );
  } else if (!props.managed) {
    return (
      <Tooltip content="Unmanaged Package" position="left" className="sbt-package-upgrade-checkbox">
        <Icon iconSize={15} icon="warning-sign" intent="warning" />
      </Tooltip>
    );
  } else {
    return (
      <Checkbox
        checked={props.checked}
        onChange={props.onToggle}
        disabled={props.disabled}
        className="sbt-package-upgrade-checkbox"
      />
    );
  }
};
