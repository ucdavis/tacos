import * as React from "react";
import { createRoot } from "react-dom/client";

import SubmissionContainer from "../containers/SubmissionContainer";

import { IDepartment } from "../models/IDepartment";
import { IRequest } from "../models/IRequest";

import "../main.css";
import "../css/site.scss";

declare const department: IDepartment;
declare const model: IRequest[];

function renderApp() {
    const appElement = document.getElementById("react-app");
    if (!appElement) {
        return;
    }

    // This code starts up the React app when it runs in a browser. It sets up the routing
    // configuration and injects the app into a DOM element.
    createRoot(appElement).render(
        <SubmissionContainer department={department} requests={model} />
    );
}

renderApp();
