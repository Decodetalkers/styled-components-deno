/**
 * @module
 * This is a deno version styled-component, very simple version.
 *
 * @example
 *
 * ```typescript
 * import styled from "@nobody/styled-component-deno";
 *
 * const Title = styled.div`
 *    font-size: 4em;
 *    text-align: center;
 *    color: #BF4F74
 *  `
 * const Title5 = styled.div<{ highlight?: boolean }>`
 *    font-size: 4em;
 *    text-align: center;
 *    color: ${(prop) => {
 *  if (prop.highlight) {
 *    return "#BF4F74";
 *  }
 *  return "#777777";
 * }}
 *
 * ```
 */

import { css, dynamicCSS, styled } from "./styled.tsx";

export type { DynamicCSSFn } from "./styled.tsx";

export default styled;

export { css, dynamicCSS, styled };
