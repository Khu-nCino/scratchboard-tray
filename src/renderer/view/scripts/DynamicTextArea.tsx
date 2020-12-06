import React from "react";
import { TextArea } from "@blueprintjs/core";

interface OwnProps {
    body: string;
    onchange: (value: string) => void;
}

export function DynamicTextArea(props: OwnProps) {
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