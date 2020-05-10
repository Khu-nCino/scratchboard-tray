import React from "react";
import { connect } from "react-redux";
import { ButtonGroup, Button, Popover, Menu, MenuItem } from "@blueprintjs/core";

import { listOrgsRequest } from "renderer/store/orgs";
import { pushRouteAction } from "renderer/store/route";
import { CustomDispatch } from "renderer/store";

type Props = ReturnType<typeof mapDispatchToProps>;

function OrgListTitleBar(props: Props) {
  const routesMenu = (
    <Menu>
      <MenuItem text="URL Converter" icon="flows" onClick={props.viewFrontdoor} />
      <MenuItem text="Settings" icon="cog" onClick={props.viewSettings} />
    </Menu>
  );

  return (
    <div className="sbt-titlebar-container">
      <h2 className="sbt-titlebar-title">Scratchboard</h2>

      <ButtonGroup className="sbt-titlebar-button">
        <Button icon="refresh" onClick={props.refreshOrgs} />
        <Popover content={routesMenu}>
          <Button icon="chevron-down" />
        </Popover>
      </ButtonGroup>
    </div>
  );
}

const mapDispatchToProps = (dispatch: CustomDispatch) => {
  return {
    refreshOrgs: () => dispatch(listOrgsRequest()),
    viewSettings: () => dispatch(pushRouteAction("settings")),
    viewLogin: () => dispatch(pushRouteAction("login")),
    viewFrontdoor: () => dispatch(pushRouteAction("frontdoor")),
  };
};

export default connect(undefined, mapDispatchToProps)(OrgListTitleBar);
