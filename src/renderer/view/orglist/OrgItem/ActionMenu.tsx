import React from "react";
import { Menu, MenuItem } from "@blueprintjs/core";

export default function ActionMenu(props: {
  removeAction?: "logout" | "delete";
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
      <MenuItem text="Packages" onClick={props.onPackages} />
      {props.removeAction === 'delete' && <MenuItem text="Delete" intent="danger" onClick={props.onDelete} />}
      {props.removeAction === 'logout' && <MenuItem text="Logout" intent="danger" onClick={props.onLogout} />}
    </Menu>
  );
}
