import React, { useState, useMemo } from "react";
import { InputGroup, Button, FormGroup, NonIdealState, Spinner } from "@blueprintjs/core";
import { popRouteAction, setNavigationEnabledAction } from "renderer/store/route";
import { connect } from "react-redux";
import { loginOrg } from "renderer/api/sfdx";
import { CustomDispatch } from "renderer/store";
import { createErrorToast } from "renderer/store/messages";
import { CanceledExecutionError } from "renderer/api/util";
import { validInstanceUrl, coerceInstanceUrl } from "renderer/api/url";
import { manager } from "renderer/api/OrgManager";

const defaultInstanceUrl = "login.salesforce.com";

type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

type DispatchProps = ReturnType<typeof mapDispatchToState>;
type Props = DispatchProps;

function LoginBody(props: Props) {
  const [instanceUrl, setInstanceUrl] = useState(defaultInstanceUrl);
  const [alias, setAlias] = useState("");
  const [cancelProcess, setCancelProcess] = useState<() => void | undefined>();

  const isUrlValid = useMemo(() => validInstanceUrl(instanceUrl), [instanceUrl]);

  if (cancelProcess !== undefined) {
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
            />
          </FormGroup>
          <FormGroup label="Alias">
            <InputGroup
              placeholder="Initial Alias"
              value={alias}
              onChange={(event: ChangeEvent) => {
                setAlias(event.target.value);
              }}
            />
          </FormGroup>
        </div>
        <div>
          <Button
            intent="primary"
            disabled={!isUrlValid}
            onClick={async () => {
              const childProcess = loginOrg(coerceInstanceUrl(instanceUrl), alias !== "" ? alias : undefined);
              props.setNavigationEnabled(false);
              setCancelProcess(() => childProcess.cancel);

              try {
                await childProcess.promise;
                await manager.checkOrgChanges();
                props.popRoute();
              } catch (error) {
                if (!(error instanceof CanceledExecutionError)) {
                  props.createErrorToast("Error authenticating", error);
                }
                props.setNavigationEnabled(true);
                setCancelProcess(undefined);
              }
            }}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }
}


function mapDispatchToState(dispatch: CustomDispatch) {
  return {
    popRoute: () => dispatch(popRouteAction()),
    setNavigationEnabled: (value: boolean) => dispatch(setNavigationEnabledAction(value)),
    createErrorToast: (message: string, detail: string) => dispatch(createErrorToast(message, detail)),
  };
}

export default connect(undefined, mapDispatchToState)(LoginBody);
