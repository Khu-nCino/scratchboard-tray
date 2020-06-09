import React, { useState } from "react";
import { InputGroup, Button, FormGroup, NonIdealState, Spinner, Icon } from "@blueprintjs/core";
import { popRouteAction, setNavigationEnabledAction } from "renderer/store/route";
import { connect } from "react-redux";
import { loginOrg } from "renderer/api/subprocess/sfdx";
import { CustomDispatch, State } from "renderer/store";
import { createErrorToast } from "renderer/store/messages";
import { CanceledExecutionError } from "renderer/api/subprocess/execute-promise-json";
import { coerceInstanceUrl } from "renderer/api/url";
import { orgManager } from "renderer/api/core/OrgManager";

const defaultInstanceUrl = "login.salesforce.com";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps & DispatchProps;

function LoginBody(props: Props) {
  const [instanceUrl, setInstanceUrl] = useState(defaultInstanceUrl);
  const [alias, setAlias] = useState("");
  const [cancelProcess, setCancelProcess] = useState<() => void | undefined>();

  const isUrlValid = Boolean(instanceUrl);

  const handleLogin = async () => {
    if (isUrlValid) {
      const childProcess = loginOrg(
        coerceInstanceUrl(instanceUrl),
        alias !== "" ? alias : undefined
      );
      props.setNavigationEnabled(false);
      setCancelProcess(() => childProcess.cancel);

      try {
        await childProcess.promise;
        await orgManager.checkOrgChanges();
        props.popRoute();
      } catch (error) {
        if (!(error instanceof CanceledExecutionError)) {
          props.createErrorToast("Error authenticating", error);
        }
        props.setNavigationEnabled(true);
        setCancelProcess(undefined);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  if (!props.sfdxValid) {
    return (
      <NonIdealState
        title="SFDX Config Required"
        description={
          <>
            No SFDX binary found.
            <br />
            Try setting the path in the <Icon icon="cog" /> screen and coming back.
          </>
        }
      />
    );
  } else if (cancelProcess !== undefined) {
    return (
      <NonIdealState
        title="Authenticating"
        description="Finish process in your browser."
        icon={<Spinner />}
        action={
          <Button
            intent="danger"
            onClick={() => {
              cancelProcess();
              setCancelProcess(undefined);
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

function mapStateToProps(state: State) {
  return {
    sfdxValid: state.settings.isSfdxPathValid,
  };
}

function mapDispatchToProps(dispatch: CustomDispatch) {
  return {
    popRoute: () => dispatch(popRouteAction()),
    setNavigationEnabled: (value: boolean) => dispatch(setNavigationEnabledAction(value)),
    createErrorToast: (message: string, detail: string) =>
      dispatch(createErrorToast(message, detail)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginBody);
