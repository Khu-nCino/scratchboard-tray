import React from 'react';
import { Menu, MenuItem } from "@blueprintjs/core";

export default function ActionMenu(props: {
  onCopyFrontdoor: () => void,
  onSetAlias: () => void,
  onDelete: () => void
}) {
  return (
    <Menu>
      <MenuItem text="Copy Front Door" onClick={props.onCopyFrontdoor} />
      <MenuItem text="Set Alias" onClick={props.onSetAlias} />
      <MenuItem
        text="Delete"
        intent="danger"
        onClick={props.onDelete}
      />
    </Menu>
  )
}