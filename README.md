# Simple Styled Component for deno preact

[![JSR](https://jsr.io/badges/@nobody/styled-components-deno)](https://jsr.io/@nobody/styled-components-deno)

It is the same with the origin one, although it is a simpler one. but it has
most features.

```tsx
import type { PropsWithChildren } from "react";

import { render } from "preact";

import { useEffect, useRef, useState } from "preact/hooks";

import styled, { css, dynamicCSS, StyleGroup } from "styled-components-deno";

import colors from "./colors.ts";
const FontSize = 3;

const styledKeys = ["fade-in-section", "is-visible"] as const;

const style = new StyleGroup(styledKeys, "fade-in-section");

style.setCSS("fade-in-section")`
  opacity: 0;
  transform: translateY(20vh);
  visibility: hidden;
  transition: opacity 0.6s ease-out, transform 1.2s ease-out;
  will-change: opacity, visibility;
`;
style.setCSS("is-visible")`
  opacity: 1;
  transform: none;
  visibility: visible;
`;

const fadeCSS = style.generate();

const Title3 = styled.div`
  font-size: ${FontSize}em;
  text-align: center;
  color: #BF4F74;
`;

const Title4 = styled.div({
  fontSize: "2em",
  textAlign: "center",
  color: "#BF4F74",
});

type TitleProp = {
  title?: string;
  className?: string;
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
  background-color: #f1f1f1aa;
  cursor: move;
  backdrop-filter: blur(10px);
`;

function Title1({ title, className, children }: PropsWithChildren<TitleProp>) {
  return (
    <div className={className}>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

const Box = styled.div`
  padding: 50px;
  margin: 20px 0;
  & span {
    background-color: rgba(255, 255, 255, 0.5);
    display: inline-block;
    padding: 5px;
    border-radius: 3px;
  }
`;

function FadeInSection({ children }: PropsWithChildren) {
  const [isVisible, setVisible] = useState(true);
  const domRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setVisible(entry.isIntersecting));
    });
    observer.observe(domRef.current!);
    return () => observer.unobserve(domRef.current!);
  }, []);
  return (
    <div
      className={`${fadeCSS["fade-in-section"]} ${
        isVisible ? fadeCSS["is-visible"] : ""
      }`}
      ref={domRef}
    >
      {children}
    </div>
  );
}

// This extend the Title4
const Title4Extend = styled(Title4)`
  font-weight: bold;
`;

const Title2 = styled(Title1)`
  font-size: 2em;
  text-align: center;
  color: #000FFEE;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const Title5 = styled.div<{ highlight?: boolean }>`
    font-size: 3em;
    text-align: center;
    color: ${(prop) => {
  if (prop.highlight) {
    return "#BF4F74";
  }
  return "#777777";
}}
`;

const Title6 = css`
  font-size: ${FontSize}em;
  text-align: center;
  color: #BF4F74;
`;

const MainDiv = styled.div`
  font-family: sans-serif;
  text-align: center;
  max-width: 100%;
  padding: 1em;
`;

function MovedWindow() {
  const [windowPos, setWindowPos] = useState<WindowPosition>({ x: 0, y: 0 });
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
    <MainDiv>
      <FadeInSection>
        <Title1 title={"CSS 1"}>
          <p>This a origin all one with out any css</p>
        </Title1>

        <Title2 title={"css1 with css"}>CSS2 I add css to CSS1</Title2>
        <Title3>CSS3: add base css</Title3>
        <Title4>CSS4: I am css with style object</Title4>
        <Title4Extend>
          CSS4: I am also css4, but bold
        </Title4Extend>
        <Title5 highlight={false}>CSS5: Title without highlight</Title5>
        <Title5 highlight={true}>CSS5: Title With highlight</Title5>
        <div class={Title6}>CSS 6</div>
        <div class={Title6}>CSS 7</div>
      </FadeInSection>
      {colors.map((color) => (
        <FadeInSection key={color}>
          <Box style={{ backgroundColor: color }}>
            <span>{color}</span>
          </Box>
        </FadeInSection>
      ))}
      <MovedWindow />
    </MainDiv>
  );
}

const mount = document.getElementById("mount");

if (mount) {
  render(<App />, mount!);
}
```
