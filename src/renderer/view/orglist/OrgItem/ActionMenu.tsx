import React from "react";
import { Menu, MenuItem } from "@blueprintjs/core";

interface Props {
  removeAction?: "logout" | "delete";
  onCopyFrontdoor: () => void;
  onSetAlias: () => void;
  onDelete: () => void;
  onLogout: () => void;
  onPackages: () => void;
  onScripts: () => void;
}

export const ActionMenu = (props: Props) => (
  <Menu>
    <MenuItem text="Copy Front Door" onClick={props.onCopyFrontdoor} />
    <MenuItem text="Set Alias" onClick={props.onSetAlias} />
    <MenuItem text="Packages" onClick={props.onPackages} />
    <MenuItem text="Scripts" onClick={props.onScripts} />
    {props.removeAction === "delete" && (
      <MenuItem text="Delete" intent="danger" onClick={props.onDelete} />
    )}
    {props.removeAction === "logout" && (
      <MenuItem text="Logout" intent="danger" onClick={props.onLogout} />
    )}
  </Menu>
);
