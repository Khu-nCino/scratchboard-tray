import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ButtonGroup, Button, Popover } from "@blueprintjs/core";

import { popRoute } from "renderer/store/route";
import { ScratchBoardState } from "renderer/store";

import { ObjectMenu } from "./ScriptsDropdown";
import { PackageMenu } from "./ScriptsDropdown";

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
      <Popover content={<PackageMenu />} >
        <Button rightIcon="caret-down" icon="box" text="Package"/>
      </Popover>
      <Popover content={<ObjectMenu />} >
        <Button rightIcon="caret-down" icon="square" text="Object"/>
      </Popover>
    </ButtonGroup>
  </div>
));
