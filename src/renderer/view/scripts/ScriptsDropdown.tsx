import { Icon, IconName, IProps, Menu, MenuItem } from "@blueprintjs/core";
import { iconClass } from "@blueprintjs/core/lib/esm/common/classes";
import * as React from "react";

export interface MenuItemOption {
    text: string;
    icon: IconName;
}
export interface IFileMenuProps extends IProps {
    shouldDismissPopover?: boolean;
    onSelect?: (category: string) => void;
    options: MenuItemOption[];
}

export const Submenu: React.FunctionComponent<IFileMenuProps> = props => (
    <Menu className={props.className}>
        {props.options.map((item) => <MenuItem text={item.text} icon={item.icon} key={item.text} onClick={() => props.onSelect?.(item.text)}/>)}
    </Menu>
);

export const PackageMenuItems:MenuItemOption[] = [
    {
        text: "LLC_BI",
        icon: "key",
    },
    {
        text: "nRetail",
        icon: "shop",
    },
];

export const ObjectMenuItems:MenuItemOption[] = [
    {
        text: "All",
        icon: "plus",
    },
    {
        text: "Account",
        icon: "person",
    },
    {
        text: "Contact",
        icon: "phone",
    },
    {
        text: "Loan",
        icon: "dollar",
    },
];
