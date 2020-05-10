import React, { useState } from "react";
import cn from "classnames";
import { Icon, Collapse, Button, IconName, Tooltip } from "@blueprintjs/core";

interface OwnProps {
  title: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  auxButtonIcon?: IconName;
  onAuxButtonClick?: () => void;
  auxButtonTip?: string;
  children: React.ReactNode;
}

type Props = OwnProps;

function CollapseGroup(props: Props) {
  const [auxTooltipOpen, setAuxTooltipOpen] = useState(false);

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
            <Tooltip
              content={props.auxButtonTip}
              isOpen={auxTooltipOpen}
              onInteraction={(nextState) => {
                setAuxTooltipOpen(nextState);
              }}
              position="left"
              boundary="viewport"
            >
              <Button
                icon={props.auxButtonIcon}
                minimal
                small
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  event.stopPropagation();
                  setAuxTooltipOpen(false);
                  props.onAuxButtonClick?.();
                }}
              />
            </Tooltip>
          </span>
        )}
      </div>
      <Collapse isOpen={isOpen}>{props.children}</Collapse>
    </div>
  );
}

export default CollapseGroup;
