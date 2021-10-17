import * as React from "react";
import { Header } from "./Header";
import { Content } from "./Content";

const arr = [1, 2, 3, 4, 5];

export function App() {
  const x = arr.find((item) => item === 2);
  console.log(x);

  return (
    <>
      <Header />
      <Content />
    </>
  );
}
