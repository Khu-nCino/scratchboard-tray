import './index.scss';

import React from "react";
import ReactDom from "react-dom";
import { Provider } from 'react-redux';

import { getCurrentPaths, setPaths } from "../common/path-util";
import { createStore } from './store';

import App from "./view/App";
import { listOrgsRequest } from './store/orgs';

const basePaths = getCurrentPaths();
setPaths([
    "/usr/local/bin",
    ...basePaths
]);

const store = createStore();
store.dispatch(listOrgsRequest());

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("app")
);
