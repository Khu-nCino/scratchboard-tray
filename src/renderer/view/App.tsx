import React  from "react";
import { CSSTransition } from "react-transition-group";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Toast, Toaster, Position, Intent, IconName } from "@blueprintjs/core";

import { State } from "../store";
import OrgListBody from "./orglist/OrgListBody";
import OrgListTitle from "./orglist/OrgListTitle";
import OtherTitle from "./OtherTitle";
import SettingsBody from "./settings/SettingsBody";
import { dismissToast } from "../store/jobs";

const intentIcons: Record<Intent, IconName | undefined> = {
  "success": "tick",
  "danger": "error",
  "warning": "warning-sign",
  "none": undefined,
  "primary": undefined
}

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

function App(props: Props) {
  //This is definitely a hack
  return (
    <div
      id="app-content"
    >
      <RouteTransitions
        activeRoute={props.routeName}
        routes={{
          orgList: (
            <div style={{ height: "100%" }}>
              <OrgListTitle />
              <OrgListBody />
            </div>
          ),
          settings: (
            <div style={{ height: "100%" }}>
              <OtherTitle title="Settings" />
              <SettingsBody />
            </div>
          ),
          dependencies: <OtherTitle title="Dependencies" />
        }}
      />
      <Toaster position={Position.BOTTOM}>
        {props.toasts.map(toast =>
          <Toast
            key={toast.id}
            message={toast.message}
            intent={toast.intent}
            icon={intentIcons[toast.intent]}
            onDismiss={() => props.dismissToast(toast.id)}
          />
        )}
      </Toaster>
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
    toasts: state.jobs.toasts
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    dismissToast: (toastId: number) => dispatch(dismissToast(toastId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
