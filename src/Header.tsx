import * as React from "react";

type HeaderProps = {
  x?: string;
  y?: string;
  z?: string;
};

export function Header(props: HeaderProps) {
  const { x = "X", ...restProps } = props;

  console.log(restProps);

  return (
    <header>
      <h1>I am header {x}</h1>
    </header>
  );
}
