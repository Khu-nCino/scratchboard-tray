import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ButtonGroup, Button } from "@blueprintjs/core";

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
type Props = ConnectedProps<typeof connector>;

export const ScriptsTitleBar = connector((props: Props) => (
  <div className="sbt-titlebar-container">
    <h2 className="sbt-titlebar-title">Scripts</h2>

    <ButtonGroup className="sbt-titlebar-button">
        <Button icon="caret-left" onClick={props.popRoute} disabled={!props.navigationEnabled}>
          Back
        </Button>
      {/* <Button icon="link" onClick={() => props.pushRoute("frontdoor")} />
      <Button icon="cog" onClick={() => props.pushRoute("settings")} /> */}
    </ButtonGroup>
  </div>
));
