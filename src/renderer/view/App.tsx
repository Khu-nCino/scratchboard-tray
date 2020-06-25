import React from "react";
import { connect, ConnectedProps } from "react-redux";

import { State } from "renderer/store";
import { RouteTransitions } from "./RouteTransitions";
import { OrgListBody } from "./orglist/OrgListBody";
import { OrgListTitleBar } from "./orglist/OrgListTitleBar";
import { TitleBar } from "./TitleBar";
import { SettingsBody } from "./settings/SettingsBody";
import { FrontDoorBody } from "./frontdoor/FrontDoorBody";
import { ToastManager } from "./ToastManager";
import { LoginBody } from "./login/LoginBody";
import { selectActiveRoute } from "renderer/store/route";

function mapStateToProps(state: State) {
  return {
    activeRoute: selectActiveRoute(state.route),
    theme: state.settings.theme,
  };
}

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

export const App = connector((props: Props) => (
  <div id="app-content">
    <RouteTransitions
      activeRoute={props.activeRoute}
      routes={{
        orgs: (
          <div className="sbt-screen">
            <OrgListTitleBar />
            <OrgListBody />
          </div>
        ),
        settings: (
          <div className="sbt-screen">
            <TitleBar title="Settings" />
            <SettingsBody />
          </div>
        ),
        login: (
          <div className="sbt-screen">
            <TitleBar title="Authenticate Org" />
            <LoginBody />
          </div>
        ),
        frontdoor: (
          <div className="sbt-screen">
            <TitleBar
              title="Link Converter"
              helpText="This route converts a salesforce URL into a shareable frontdoor link."
            />
            <FrontDoorBody />
          </div>
        ),
      }}
    />
    <ToastManager />
  </div>
));
