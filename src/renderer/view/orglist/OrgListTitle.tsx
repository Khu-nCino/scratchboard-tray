import React from "react";
import { AnyAction } from "redux";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { ButtonGroup, Button } from "@blueprintjs/core";

import { listOrgsRequest } from "../../store/orgs";
import { viewSettings } from "../../store/route";
import { State } from "../../store";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

function Title(props: Props) {
  return (
    <div className="sbt-titlebar-container">
      <h2 className="sbt-titlebar-title">Scratchboard</h2>

      <ButtonGroup className="sbt-titlebar-button">
        {props.displayAllOrgs && <Button icon="log-in" />}
        <Button icon="refresh" onClick={props.refreshOrgs} />
        <Button icon="cog" onClick={props.viewSettings} />
      </ButtonGroup>
    </div>
  );
}

const mapStateToProps = (state: State) => {
  return {
    displayAllOrgs: state.settings.features.displayAllOrgs,
  };
};

const mapDispatchToProps = (
  dispatch: ThunkDispatch<State, undefined, AnyAction>
) => {
  return {
    refreshOrgs: () => dispatch(listOrgsRequest()),
    viewSettings: () => dispatch(viewSettings()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Title);
