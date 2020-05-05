import React from "react";
import { AnyAction } from "redux";
import { connect } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { ButtonGroup, Button } from "@blueprintjs/core";

import { listOrgsRequest } from "renderer/store/orgs";
import { viewSettings } from "renderer/store/route";
import { State } from "renderer/store";

type Props = ReturnType<typeof mapDispatchToProps>;

function OrgListTitleBar(props: Props) {
  return (
    <div className="sbt-titlebar-container">
      <h2 className="sbt-titlebar-title">Scratchboard</h2>

      <ButtonGroup className="sbt-titlebar-button">
        <Button icon="refresh" onClick={props.refreshOrgs} />
        <Button icon="cog" onClick={props.viewSettings} />
      </ButtonGroup>
    </div>
  );
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<State, undefined, AnyAction>
) => {
  return {
    refreshOrgs: () => dispatch(listOrgsRequest()),
    viewSettings: () => dispatch(viewSettings()),
  };
};

export default connect(undefined, mapDispatchToProps)(OrgListTitleBar);
