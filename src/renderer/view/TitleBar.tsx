import React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ButtonGroup, Button } from "@blueprintjs/core";

import { viewOrgList } from "../store/route";

interface OwnProps {
  title: string;
}

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = OwnProps & DispatchProps;

function TitleBar(props: Props) {
  return (
    <div className="sbt-titlebar-container">
      <h2 className="sbt-titlebar-title">{props.title}</h2>

      <ButtonGroup className="sbt-titlebar-button">
        <Button icon="caret-left" onClick={props.back}>
          Back
        </Button>
      </ButtonGroup>
    </div>
  );
}

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    back: () => dispatch(viewOrgList()),
  };
};

export default connect(undefined, mapDispatchToProps)(TitleBar);
