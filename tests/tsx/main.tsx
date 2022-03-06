import React from "react";
import { render as reactRender } from "react-dom";
import App from "./App";

export function render(root: HTMLElement) {
  reactRender(<App />, root);
}
