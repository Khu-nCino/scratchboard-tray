import React from "react";
import { CSSTransition } from "react-transition-group";

interface Props<T extends string> {
  primaryRoute: T;
  activeRoute: T;
  routes: Record<T, JSX.Element>;
}

export const RouteTransitions = <T extends string>(props: Props<T>) => (
  <>
    {(Object.entries(props.routes) as [T, JSX.Element][]).map(([routeName, element]) => (
      <CSSTransition
        key={routeName}
        in={props.activeRoute === routeName}
        timeout={500}
        classNames={
          props.primaryRoute === routeName
            ? "sbt-route-transition--enters-left"
            : "sbt-route-transition--enters-right"
        }
        unmountOnExit
      >
        {element}
      </CSSTransition>
    ))}
  </>
);
