import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { ScratchBoardState } from "renderer/store";
import { orgCache } from "renderer/api/core/OrgCache";
import { TextArea, Button } from "@blueprintjs/core";

interface OwnProps extends ConnectedProps<typeof connector> {
    Name: string,
    Package: string,
    Object: string,
    Description: string,
    Body: string
}

async function runScript(username: string, body: string) {
    const connection = await orgCache.getConnection(username);
    connection.tooling.executeAnonymous(body, function(err, res) {
        if (err) { return console.error(err); }
        console.log("compiled?: " + res.compiled); // compiled successfully
        console.log("executed?: " + res.success); // executed successfully
    });
}

function mapStateToProps(state: ScratchBoardState) {
    return {username: state.route.detailUsername!!}
}

function DynamicTextArea(props: {body: string, onchange: (value: string) => void}) {
    const columns = 100;
    let rows = (props.body.match(/\n/g) || []).length;
    return(
        <TextArea fill 
                onChange={(event) => props.onchange(event.target.value)} 
                cols={columns} 
                rows={rows}
                value={props.body}>
        </TextArea>)
}

const connector = connect(mapStateToProps);

export const ScriptsItem = connector((props: OwnProps) => {
    const [body, setBody] = useState(props.Body);
    return(
    <div className="sbt-org-list--item sbt-flex-container sbt-hover-highlight">
        <div className="sbt-ml_medium">
            { props.Name } <br/>
            { props.Package } <br/>
            { props.Object } <br/>
            { props.Description } <br/>
            <DynamicTextArea body={body} onchange={setBody} />  <br/>
            <Button intent="primary" onClick={() => runScript(props.username, body)}>
                Run in org 
            </Button>
            <hr/>
        </div>
    </div>
    );
});