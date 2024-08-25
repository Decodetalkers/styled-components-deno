/* @jsx h */

import { h, render } from "preact";

import styled from "styled-components-deno";

const Title = styled.div`
    font-size: 2em;
    text-align: center;
    color: #BF4F74;
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
        <h1>hello</h1>
      </div>
    </main>
  );
}
