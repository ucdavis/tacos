import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";

import SubmissionContainer from '../containers/SubmissionContainer';

import { IDepartment } from "../models/IDepartment";

declare var departments: IDepartment[];

function renderApp() {
  // This code starts up the React app when it runs in a browser. It sets up the routing
  // configuration and injects the app into a DOM element.
  ReactDOM.render(
    <AppContainer>
      <SubmissionContainer departments={departments} />
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
