import { ipcRenderer } from "electron";
import React, { useState } from "react";
import { InputGroup, Button, FormGroup, NonIdealState, Spinner } from "@blueprintjs/core";
import { popRouteAction, setNavigationEnabledAction } from "renderer/store/route";
import { connect } from "react-redux";
import { authManager } from "renderer/api/core/AuthManager";
import { CustomDispatch } from "renderer/store";
import { createErrorToast } from "renderer/store/messages";
import { coerceInstanceUrl } from "renderer/api/url";
import { IpcRendererEvent } from "common/IpcEvent";

const defaultInstanceUrl = "login.salesforce.com";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = DispatchProps;

function LoginBody(props: Props) {
  const [instanceUrl, setInstanceUrl] = useState(defaultInstanceUrl);
  const [alias, setAlias] = useState("");
  const [inProgress, setInProgress] = useState<boolean>();

  const isUrlValid = Boolean(instanceUrl);

  const handleLogin = async () => {
    if (isUrlValid) {
      try {
        setInProgress(true);
        props.setNavigationEnabled(false);
        await authManager.webAuth(coerceInstanceUrl(instanceUrl), alias || undefined);
        ipcRenderer.send(IpcRendererEvent.REQUEST_FOCUS);

        props.popRoute();
      } catch (error) {
        ipcRenderer.send(IpcRendererEvent.REQUEST_FOCUS);
        props.createErrorToast("Error authenticating", error);
        props.setNavigationEnabled(true);
        setInProgress(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  if (inProgress) {
    return (
      <NonIdealState
        title="Authenticating"
        description="Finish process in your browser."
        icon={<Spinner />}
        action={
          <Button
            intent="danger"
            onClick={() => {
              authManager.closeServer();
              setInProgress(false);
              props.setNavigationEnabled(true);
            }}
          >
            Abort
          </Button>
        }
      />
    );
  } else {
    return (
      <div className="sbt-m_medium">
        <div>
          <FormGroup label="Login URL" labelInfo="(required)">
            <InputGroup
              placeholder="Login url"
              intent={isUrlValid ? "none" : "danger"}
              value={instanceUrl}
              onChange={(event: ChangeEvent) => {
                setInstanceUrl(event.target.value);
              }}
              onKeyPress={handleKeyPress}
            />
          </FormGroup>
          <FormGroup label="Alias">
            <InputGroup
              placeholder="Initial Alias"
              value={alias}
              onChange={(event: ChangeEvent) => {
                setAlias(event.target.value);
              }}
              onKeyPress={handleKeyPress}
            />
          </FormGroup>
        </div>
        <div>
          <Button intent="primary" disabled={!isUrlValid} onClick={handleLogin}>
            Login
          </Button>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch: CustomDispatch) {
  return {
    popRoute: () => dispatch(popRouteAction()),
    setNavigationEnabled: (value: boolean) => dispatch(setNavigationEnabledAction(value)),
    createErrorToast: (message: string, detail: string) =>
      dispatch(createErrorToast(message, detail)),
  };
}

export default connect(undefined, mapDispatchToProps)(LoginBody);
