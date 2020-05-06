import React from "react";
import { connect } from "react-redux";
import { ButtonGroup, Button } from "@blueprintjs/core";

import { listOrgsRequest } from "renderer/store/orgs";
import { pushRouteAction } from "renderer/store/route";
import { CustomDispatch } from "renderer/store";

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
  dispatch: CustomDispatch
) => {
  return {
    refreshOrgs: () => dispatch(listOrgsRequest()),
    viewSettings: () => dispatch(pushRouteAction("settings")),
  };
};

export default connect(undefined, mapDispatchToProps)(OrgListTitleBar);
