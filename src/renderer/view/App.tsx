import React from "react";
import { CSSTransition } from "react-transition-group";
import { connect } from "react-redux";

import { State } from "../store";
import { RouteName } from "../store/route";
import OrgListBody from "./orglist/OrgListBody";
import OrgListTitle from "./orglist/OrgListTitle";
import OtherTitle from "./OtherTitle";

interface StateProps {
  routeName: RouteName;
}

class App extends React.Component<StateProps> {
  renderContents() {
    return (
      <RouteTransitions activeRoute={this.props.routeName} routes={{
        orgList: (
          <div style={{position: 'absolute', width: '100%'}}>
            <OrgListTitle />
            <OrgListBody />
          </div>
        ),
        settings: <OtherTitle title="Settings" />,
        dependencies: <OtherTitle title="Dependencies" />
      }} />
    );
  }

  render() {
    return (
      <div id="app-content" className="bp3-dark">
        {this.renderContents()}
      </div>
    );
  }
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

function mapStateToProps(state: State): StateProps {
  return {
    routeName: state.route.name
  };
}

export default connect(mapStateToProps)(App);
