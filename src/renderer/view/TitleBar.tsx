import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ButtonGroup, Button, Icon, Tooltip } from "@blueprintjs/core";

import { popRouteAction } from "renderer/store/route";
import { State } from "renderer/store";

interface OwnProps {
  title: string;
  helpText?: string;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & StateProps & DispatchProps;

function TitleBar(props: Props) {
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
        <Button icon="caret-left" onClick={props.back} disabled={!props.navigationEnabled}>
          Back
        </Button>
      </ButtonGroup>
    </div>
  );
}

function mapStateToProps(state: State) {
  return {
    navigationEnabled: state.route.navigationEnabled,
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    back: () => dispatch(popRouteAction()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TitleBar);
