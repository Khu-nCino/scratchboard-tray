import React from "react";
import { Checkbox, Spinner, Icon, Tooltip } from "@blueprintjs/core";

interface Props {
  checked: boolean;
  onToggle: () => void;
  loading: boolean;
  managed: boolean;
  disabled: boolean;
}

export const UpgradeCheckbox = (props: Props) => {
  if (props.loading) {
    return <Spinner size={15} />;
  } else if (!props.managed) {
    return (
      <Tooltip content="Unmanaged Package" position="left" className="sbt-package-upgrade-checkbox">
        <Icon iconSize={15} icon="warning-sign" intent="warning"/>
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
