import React from "react";
import { CSSTransition } from "react-transition-group";
import { connect } from "react-redux";

import { State } from "renderer/store";
import OrgListBody from "./orglist/OrgListBody";
import OrgListTitle from "./orglist/OrgListTitleBar";
import TitleBar from "./TitleBar";
import SettingsBody from "./settings/SettingsBody";
import FrontDoorBody from "./frontdoor/FrontDoorBody";
import { PackageBody } from "./package/PackageBody";
import ToastManager from "./ToastManager";
import LoginBody from "./login/LoginBody";
import { selectActiveRoute } from "renderer/store/route";

type Props = ReturnType<typeof mapStateToProps>;

function App(props: Props) {
  return (
    <div id="app-content">
      <RouteTransitions
        activeRoute={props.activeRoute}
        routes={{
          orgs: (
            <div className="sbt-screen">
              <OrgListTitle />
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
          package: (
            <div className="sbt-screen">
              <TitleBar title="Packages" />
              <PackageBody  />
            </div>
          )
        }}
      />
      <ToastManager />
    </div>
  );
}

function RouteTransitions(props: {
  activeRoute: string;
  routes: Record<string, JSX.Element>;
}): JSX.Element {
  return (
    <>
      {Object.entries(props.routes).map(([routeName, element], index) => (
        <CSSTransition
          key={routeName}
          in={props.activeRoute === routeName}
          timeout={500}
          classNames={index ? "route-transition--reverse" : "route-transition"}
          unmountOnExit
        >
          {element}
        </CSSTransition>
      ))}
    </>
  );
}

function mapStateToProps(state: State) {
  return {
    activeRoute: selectActiveRoute(state.route),
    theme: state.settings.theme,
  };
}

export default connect(mapStateToProps)(App);
