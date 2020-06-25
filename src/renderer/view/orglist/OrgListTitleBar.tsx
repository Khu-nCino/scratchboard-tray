import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { ButtonGroup, Button } from "@blueprintjs/core";

import { pushRoute } from "renderer/store/route";

const mapDispatchToProps = {
  pushRoute,
};

const connector = connect(undefined, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export const OrgListTitleBar = connector((props: Props) => (
  <div className="sbt-titlebar-container">
    <h2 className="sbt-titlebar-title">Scratchboard</h2>

    <ButtonGroup className="sbt-titlebar-button">
      <Button icon="link" onClick={() => props.pushRoute("frontdoor")} />
      <Button icon="cog" onClick={() => props.pushRoute("settings")} />
    </ButtonGroup>
  </div>
));
