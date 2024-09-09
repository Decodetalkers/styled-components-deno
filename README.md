# Simple Styled Component for deno preact

[![JSR](https://jsr.io/badges/@nobody/styled-components-deno)](https://jsr.io/@nobody/styled-components-deno)

It is the same with the origin one, although it is a simpler one. but it has
most features.

```tsx

import type { PropsWithChildren } from "react";

import { render } from "preact";

import { useRef, useState } from "preact/hooks";

import styled, { dynamicCss } from "@nobody/styled-components-deno";

const FontSize = 2;

const Title3 = styled.div`
  font-size: ${FontSize}em;
  text-align: center;
  color: #BF4F74;
`;

const Title4 = styled.div({
  fontSize: "3em",
  textAlign: "center",
  color: "#BF4F74",
});

type TitleProp = {
  title?: string;
};

type WindowPosition = {
  x: number;
  y: number;
};

const Window = dynamicCSS<WindowPosition>`
  width: 400px;
  height: 200px;
  position: absolute;
  top: ${(prop) => `${prop.y}px`};
  left: ${(prop) => `${prop.x}px`};
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  cursor: move;
`;

function Title1({ title, children }: PropsWithChildren<TitleProp>) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

const Title2 = styled(Title1)`
  font-size: 2em;
  text-align: center;
  color: #000FFEE;
  margin-top: 40px;
  margin-bottom: 40px;
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
`;

const mount = document.getElementById("mount");

if (mount) {
  render(<App />, mount!);
}

function MovedWindow() {
  const [windowPos, setWindowPos] =useState<WindowPosition>({x: 0, y: 0});
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: MouseEvent) => {
    const windowElement = windowRef.current;
    if (!windowElement) {
      return;
    }

    const offsetX = e.clientX - windowElement.offsetLeft;
    const offsetY = e.clientY - windowElement.offsetTop;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const left = moveEvent.clientX - offsetX;
      const top = moveEvent.clientY - offsetY;
      setWindowPos({ x: left, y: top });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={windowRef}
      className={Window(windowPos)}
      onMouseDown={handleMouseDown}
    >
      <Title3>I am a draggable component, use dynamicCSS</Title3>
    </div>
  );
}

function App() {
  return (
    <main>
      <div>
        <Title1 title={"CSS 1"}>
          <p>This a origin all one with out any css</p>
        </Title1>
        <Title2 title={"css1 with css"}>I add css to CSS1</Title2>
        <Title3>CSS3: add base css</Title3>
        <Title4>CSS4: I am css with style object</Title4>
        <Title5 highlight={false}>CSS5: Title with highlight</Title5>
        <Title5 highlight={true}>Css5:Title With out highlight</Title5>
        <MovedWindow />
      </div>
    </main>
  );
}
```
