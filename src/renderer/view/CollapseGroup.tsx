import React from "React";
import cn from "classnames";
import { Icon, Collapse, Button } from "@blueprintjs/core";

interface OwnProps {
  title: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  showPlusButton?: boolean;
  children: React.ReactNode;
}

type Props = OwnProps;

function CollapseGroup(props: Props) {
  return (
    <div>
      <div onClick={props.onToggleOpen} className="sbt-collapse-group--header">
        <span className={cn({ chevron: true, open: props.isOpen })}>
          <Icon icon="chevron-right" />
        </span>
        <span>{props.title}</span>
        {props.showPlusButton && <span style={{ marginLeft: "auto", marginRight: "2px" }}>
          <Button icon="plus" minimal small onClick={(event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
          }} />
        </span>}
      </div>
      <Collapse isOpen={props.isOpen}>{props.children}</Collapse>
    </div>
  );
}

export default CollapseGroup;
