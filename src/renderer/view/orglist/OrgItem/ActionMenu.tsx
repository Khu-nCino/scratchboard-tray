import React from "react";
import { Menu, MenuItem } from "@blueprintjs/core";

export default function ActionMenu(props: {
  isScratchOrg: boolean;
  onCopyFrontdoor: () => void;
  onSetAlias: () => void;
  onDelete: () => void;
  onLogout: () => void;
  onPackages: () => void;
}) {
  return (
    <Menu>
      <MenuItem text="Copy Front Door" onClick={props.onCopyFrontdoor} />
      <MenuItem text="Set Alias" onClick={props.onSetAlias} />
      {props.isScratchOrg && <MenuItem text="Delete" intent="danger" onClick={props.onDelete} />}
      {!props.isScratchOrg && <MenuItem text="Logout" intent="danger" onClick={props.onLogout} />}
    </Menu>
  );
}
