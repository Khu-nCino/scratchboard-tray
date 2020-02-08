import React from "react";
import cx from "classnames";
import { CSSTransition } from "react-transition-group";
import { connect } from "react-redux";

import { State } from "../store";
import OrgListBody from "./orglist/OrgListBody";
import OrgListTitle from "./orglist/OrgListTitle";
import OtherTitle from "./OtherTitle";
import SettingsBody from "./settings/SettingsBody";

type StateProps = ReturnType<typeof mapStateToProps>

function App(props: StateProps){
  return (
    <div id="app-content" className={cx({ "bp3-dark": props.theme === 'dark' })}>
      <RouteTransitions activeRoute={props.routeName} routes={{
        orgList: (
          <div style={{position: 'absolute', width: '100%'}}>
            <OrgListTitle />
            <OrgListBody />
          </div>
        ),
        settings: (
          <div>
            <OtherTitle title="Settings" />
            <SettingsBody />
          </div>
        ),
        dependencies: <OtherTitle title="Dependencies" />
      }} />
    </div>
  );
}

function RouteTransitions(props: { activeRoute: string, routes: Record<string, JSX.Element> }): JSX.Element {
  return <>{Object.entries(props.routes).map(([routeName, element], index) => (
    <CSSTransition
      key={routeName}
      in={props.activeRoute === routeName}
      timeout={500}
      classNames={index ? "route-transition--reverse" : "route-transition"}
      unmountOnExit
    >
      {element}
    </CSSTransition>
  ))}</>;
}

function mapStateToProps(state: State) {
  return {
    routeName: state.route.name,
    theme: state.settings.theme
  };
}

export default connect(mapStateToProps)(App);
