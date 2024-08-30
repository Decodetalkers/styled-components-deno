import { styled } from "./mod.ts";

import { assertEquals } from "jsr:@std/assert";
import { elements } from "./domElements.ts";

Deno.test(function testStyledLen() {
  let size = 0;
  for (const _key in styled) {
    size += 1;
  }
  assertEquals(size, elements.length);
});
