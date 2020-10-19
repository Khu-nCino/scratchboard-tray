import { IProps, Menu, MenuItem } from "@blueprintjs/core";
import * as React from "react";

export interface IFileMenuProps extends IProps {
    shouldDismissPopover?: boolean;
}

export const PackageMenu: React.FunctionComponent<IFileMenuProps> = props => (
    <Menu className={props.className}>
        <MenuItem text="LLC_BI" icon="key" {...props} />
        <MenuItem text="nRetail" icon="shop" {...props} />
    </Menu>
);

export const ObjectMenu: React.FunctionComponent<IFileMenuProps> = props => (
    <Menu className={props.className}>
        <MenuItem text="Account" icon="person" {...props} />
        <MenuItem text="Contact" icon="phone" {...props} />
        <MenuItem text="Loan" icon="dollar" {...props} />
    </Menu>
);
