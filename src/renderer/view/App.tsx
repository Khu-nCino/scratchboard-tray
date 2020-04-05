import React from "react";
import { CSSTransition } from "react-transition-group";
import { connect } from "react-redux";

import { State } from "../store";
import OrgListBody from "./orglist/OrgListBody";
import OrgListTitle from "./orglist/OrgListTitle";
import SimpleTitle from "./SimpleTitle";
import SettingsBody from "./settings/SettingsBody";
import ToastManager from "./ToastManager";

type Props = ReturnType<typeof mapStateToProps>;

function App(props: Props) {
  return (
    <div id="app-content">
      <RouteTransitions
        activeRoute={props.routeName}
        routes={{
          orgList: (
            <div className="sbt-screen">
              <OrgListTitle />
              <OrgListBody />
            </div>
          ),
          settings: (
            <div className="sbt-screen">
              <SimpleTitle title="Settings" />
              <SettingsBody />
            </div>
          ),
          dependencies: <SimpleTitle title="Dependencies" />,
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
    routeName: state.route.name,
    theme: state.settings.theme,
  };
}

export default connect(mapStateToProps)(App);
