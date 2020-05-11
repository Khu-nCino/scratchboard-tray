import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ButtonGroup, Button, Icon, Tooltip } from "@blueprintjs/core";

import { popRouteAction } from "renderer/store/route";

interface OwnProps {
  title: string;
  hideBackButton?: boolean;
  helpText?: string;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & DispatchProps;

function TitleBar(props: Props) {
  return (
    <div className="sbt-titlebar-container">
      <h2 className="sbt-titlebar-title">
        {props.title}
      </h2>
        {props.helpText && (
          <span style={{marginTop: "auto", marginBottom: "auto"}}>
          <Tooltip content={<p style={{width: "250px", margin: "0"}}>{props.helpText}</p>} boundary="viewport" >
            <Icon icon="help" />
          </Tooltip>
          </span>
        )}
      {!props.hideBackButton && (
        <ButtonGroup className="sbt-titlebar-button">
          <Button icon="caret-left" onClick={props.back}>
            Back
          </Button>
        </ButtonGroup>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    back: () => dispatch(popRouteAction()),
  };
};

export default connect(undefined, mapDispatchToProps)(TitleBar);
