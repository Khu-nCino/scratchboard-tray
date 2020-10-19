import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ButtonGroup, Button, Popover } from "@blueprintjs/core";

import { popRoute } from "renderer/store/route";
import { ScratchBoardState } from "renderer/store";

import { Submenu, PackageMenuItems, ObjectMenuItems }from "./ScriptsDropdown";

function mapStateToProps(state: ScratchBoardState) {
    return {
        navigationEnabled: state.route.navigationEnabled,
    };
}

const mapDispatchToProps = {
  popRoute,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
interface Props extends ConnectedProps<typeof connector>{
  onScriptFilterSelect?: (category: string) => void;
}

export const ScriptsTitleBar = connector((props: Props) => (
  <div className="sbt-titlebar-container">
    <h2 className="sbt-titlebar-title">Scripts</h2>

    <ButtonGroup className="sbt-titlebar-button">
      <Button icon="caret-left" onClick={props.popRoute} disabled={!props.navigationEnabled}>
        Back
      </Button>
      <Popover content={<Submenu options={PackageMenuItems} onSelect={props.onScriptFilterSelect}/>} >
        <Button rightIcon="caret-down" icon="box" text="Package"/>
      </Popover>
      <Popover content={<Submenu options={ObjectMenuItems} onSelect={props.onScriptFilterSelect}/>} >
        <Button rightIcon="caret-down" icon="square" text="Object"/>
      </Popover>
    </ButtonGroup>
  </div>
));
