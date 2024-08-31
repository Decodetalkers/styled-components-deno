# Simple Styled Component for deno preact

[![JSR](https://jsr.io/badges/@nobody/styled-components-deno)](https://jsr.io/@nobody/styled-components-deno)

It is the same with the origin one, although it is a simpler one. but it has
most features.

```tsx
import type { PropsWithChildren } from "react";

import { render } from "preact";

import styled from "@nobody/styled-components-deno";

const Title = styled.div`
    font-size: 4em;
    text-align: center;
    color: #BF4F74;
`;

const Title4 = styled.div({
  "font-size": "4em",
  "text-align": "center",
  "color": "#BF4F74",
});

type TitleProp = {
  title?: string;
};

function Title2({ title, children }: PropsWithChildren<TitleProp>) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

const Title3 = styled(Title2)`
  font-size: 2em;
  text-align: center;
  color: #000FFEE;
`;

const Title5 = styled.div<{ highlight?: boolean }>`
    font-size: 4em;
    text-align: center;
    color: ${(prop) => {
  if (prop.highlight) {
    return "#BF4F74";
  }
  return "#777777";
}}

const mount = document.getElementById("mount");

if (mount) {
  render(<App />, mount!);
}

function App() {
  return (
    <main>
      <div>
        <Title>hello</Title>
        <Title2 title={"abcdeft"}>
          <p>ff</p>
        </Title2>
        <Title3 title={"abcd"}>hello</Title3>
        <Title4>hello4</Title4>
        <Title5 highlight={false}>hello6</Title5>
        <Title5 highlight={true}>hello6</Title5>
      </div>
    </main>
  );
}
```
