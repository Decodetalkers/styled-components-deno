import { styled } from "./mod.ts";

import { assertEquals } from "@std/assert";
import { elements } from "./domElements.ts";
import { toSnakeCase } from "./styled.ts";

Deno.test(function testStyledLen() {
  let size = 0;
  for (const _key in styled) {
    size += 1;
  }
  assertEquals(size, elements.length);
});

Deno.test(function testSnakeStyle() {
  const target = {
    "font-size": "3em",
    "text-align": "center",
    color: "#BF4F74",
  };
  const origin = {
    fontSize: "3em",
    textAlign: "center",
    color: "#BF4F74",
  };
  assertEquals(toSnakeCase(origin), target);
});
