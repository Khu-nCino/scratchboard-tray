import './index.scss';

import React from "react";
import ReactDom from "react-dom";
import { Provider } from 'react-redux';

import fixPath from "../common/fixpath";
import { createStore } from './store';

import App from "./view/App";
// import { listOrgsRequest } from './store/orgs';

fixPath();
const store = createStore();
// store.dispatch(listOrgsRequest());

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("app")
);
