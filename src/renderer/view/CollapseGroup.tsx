import React from "React";
import cn from "classnames";
import { Icon, Collapse, Button, IconName } from "@blueprintjs/core";

interface OwnProps {
  title: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  auxButtonIcon?: IconName;
  onAuxButtonClick?: () => void;
  children: React.ReactNode;
}

type Props = OwnProps;

function CollapseGroup(props: Props) {
  const disabled = !React.Children.count(props.children);
  const isOpen = !disabled && props.isOpen;

  return (
    <div>
      <div
        onClick={disabled ? undefined : props.onToggleOpen}
        className={cn({
          "sbt-collapse-group--header": true,
          "sbt-disabled": disabled,
        })}
      >
        <span className={cn({ "sbt-chevron": true, "sbt-open": isOpen })}>
          <Icon icon="chevron-right" />
        </span>
        <span>{props.title}</span>
        {props.auxButtonIcon !== undefined && (
          <span className="sbt-auxiliary-button">
            <Button
              icon={props.auxButtonIcon}
              minimal
              small
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                event.stopPropagation();
                props.onAuxButtonClick?.();
              }}
            />
          </span>
        )}
      </div>
      <Collapse isOpen={isOpen}>{props.children}</Collapse>
    </div>
  );
}

export default CollapseGroup;
