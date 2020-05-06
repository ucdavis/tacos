import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import SubmissionContainer from "../containers/SubmissionContainer";

import { IDepartment } from "../models/IDepartment";
import { IRequest } from "../models/IRequest";

import "../css/site.scss";

declare var department: IDepartment;
declare var model: IRequest[];

function renderApp() {
    // This code starts up the React app when it runs in a browser. It sets up the routing
    // configuration and injects the app into a DOM element.
    ReactDOM.render(
        <AppContainer>
            <SubmissionContainer department={department} requests={model} />
        </AppContainer>,
        document.getElementById("react-app")
    );
}

renderApp();

// Allow Hot Module Replacement
if (module.hot) {
    module.hot.accept(() => {
        renderApp();
    });
}
