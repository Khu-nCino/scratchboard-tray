import React from "react";
import { CSSTransition } from "react-transition-group";

interface Props {
  activeRoute: string;
  routes: Record<string, JSX.Element>;
}

export const RouteTransitions = (props: Props) => (
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
