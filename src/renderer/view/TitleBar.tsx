import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ButtonGroup, Button, Icon, Tooltip } from "@blueprintjs/core";

import { popRoute } from "renderer/store/route";
import { ScratchBoardState } from "renderer/store";

function mapStateToProps(state: ScratchBoardState) {
  return {
    navigationEnabled: state.route.navigationEnabled,
  };
}

const mapDispatchToProps = {
  popRoute,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
interface Props extends ConnectedProps<typeof connector> {
  title: string;
  helpText?: string;
}

export const TitleBar = connector((props: Props) => {
  return (
    <div className="sbt-titlebar-container">
      <h2 className="sbt-titlebar-title">{props.title}</h2>
      {props.helpText && (
        <span style={{ marginTop: "auto", marginBottom: "auto" }}>
          <Tooltip
            content={<p style={{ width: "250px", margin: "0" }}>{props.helpText}</p>}
            boundary="viewport"
          >
            <Icon icon="help" iconSize={13} />
          </Tooltip>
        </span>
      )}
      <ButtonGroup className="sbt-titlebar-button">
        <Button icon="caret-left" onClick={props.popRoute} disabled={!props.navigationEnabled}>
          Back
        </Button>
      </ButtonGroup>
    </div>
  );
});
