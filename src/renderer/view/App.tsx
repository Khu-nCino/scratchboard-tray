import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";

import { ScratchBoardState } from "renderer/store";
import { RouteTransitions } from "./RouteTransitions";
import { OrgListBody } from "./orglist/OrgListBody";
import { OrgListTitleBar } from "./orglist/OrgListTitleBar";
import { TitleBar } from "./TitleBar";
import { SettingsBody } from "./settings/SettingsBody";
import { FrontDoorBody } from "./frontdoor/FrontDoorBody";
import { ToastManager } from "./ToastManager";
import { LoginBody } from "./login/LoginBody";
import { selectActiveRoute } from "renderer/store/route";
import { PackageBody } from "./package/PackageBody";
import { ScriptsBody } from "./scripts/ScriptsBody";
import { ScriptAdmin } from "./scriptAdmin/ScriptAdmin";
import { ScriptsTitleBar } from "./scripts/ScriptsTitleBar";

function mapStateToProps(state: ScratchBoardState) {
  return {
    activeRoute: selectActiveRoute(state.route),
  };
}

const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

export const App = connector((props: Props) => {
  const [scriptFilter, setScriptFilter] = useState<string>('All');
  return (
  <div id="app-content">
    <RouteTransitions
      primaryRoute='orgs'
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
        package: (
          <div className="sbt-screen">
            <TitleBar title="Packages" />
            <PackageBody />
          </div>
        ),
        scripts: (
          <div className="sbt-screen">
            <ScriptsTitleBar onScriptFilterSelect={setScriptFilter} />
            <ScriptsBody filterApplied={scriptFilter}/>
          </div>
        ),
        scriptAdmin: (
          <div className="sbt-screen">
            <TitleBar title="Script Admin" />
            <ScriptAdmin />
          </div>
        ),
      }}
    />
    <ToastManager />
  </div>
)});
