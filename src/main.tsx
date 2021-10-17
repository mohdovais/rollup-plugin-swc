import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./App";

const render = (root: HTMLDivElement) => {
  ReactDOM.render(<App />, root);
};

export { render };
