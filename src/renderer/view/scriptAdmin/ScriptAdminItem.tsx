import React from "react";
import { Button, Card } from "@blueprintjs/core";

interface OwnProps {
    Name: string,
    Package: string,
    Object: string,
    Description: string,
    Body: string
}

function handleEdit() {
    console.log('edit');
}

function handleDelete() {
    console.log('edit');
}

export const ScriptAdminItem = (props: OwnProps) => {
    return(
        <Card interactive={true} className="sbt-flex-container sbt-hover-highlight">
            <div className="sbt-ml_medium script-info">
                <b>Name: </b>
                { props.Name } <br/>
                <b>Package: </b>
                { props.Package } <br/>
                <b>Object: </b>
                { props.Object } <br/>
                <b>Description: </b>
                { props.Description } <br/>
            </div>
            <div className="script-actions">
                <div className="script-action">
                    <Button
                        intent="danger"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </div>
                <div className="script-action">
                    <Button
                        intent="primary"
                        onClick={handleEdit}
                    >
                        Edit
                    </Button>
                </div>
            </div>
        </Card>
    );
};