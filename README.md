# Simple Styled Component for deno preact

It is the same with the origin one, although it is a simplier one.

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
      </div>
    </main>
  );
}
```
