import React, { useState, useMemo } from "react";
import { InputGroup, Button, FormGroup, NonIdealState, Spinner } from "@blueprintjs/core";
import { popRouteAction } from "renderer/store/route";
import { connect } from "react-redux";
import { loginOrg } from "renderer/api/sfdx";
import { listOrgsRequest } from "renderer/store/orgs";
import { CustomDispatch } from "renderer/store";
import { createErrorToast } from "renderer/store/messages";
import { CanceledExecutionError } from "renderer/api/util";

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
          <Button onClick={props.popRoute}>Cancel</Button>
          <Button
            intent="primary"
            className="sbt-ml_small"
            disabled={!isUrlValid}
            onClick={async () => {
              const childProcess = loginOrg(correctInstanceUrl(instanceUrl), alias !== "" ? alias : undefined);
              setCancelProcess(() => childProcess.cancel);

              try {
                await childProcess.promise;
                props.loadOrgs();
                props.popRoute();
              } catch (error) {
                if (!(error instanceof CanceledExecutionError)) {
                  props.createErrorToast("Error authenticating", error);
                }
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

const pattern = new RegExp('^(https:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*$', 'i'); // port and path

function validInstanceUrl(str: string): boolean {
  return pattern.test(str);
}

function correctInstanceUrl(url: string): string {
  return url.startsWith("https://") ? url : `https://${url}`;
}

function mapDispatchToState(dispatch: CustomDispatch) {
  return {
    popRoute: () => dispatch(popRouteAction()),
    loadOrgs: () => dispatch(listOrgsRequest()),
    createErrorToast: (message: string, detail: string) => dispatch(createErrorToast(message, detail)),
  };
}

export default connect(undefined, mapDispatchToState)(LoginBody);
