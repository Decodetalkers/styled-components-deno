/** @jsxRuntime automatic */
/** @jsxImportSource npm:preact@10.23.2 */

import {
  type ClassAttributes,
  h as createPreactElement,
  type JSX,
} from "preact";

import type React from "react";
import { domElements, type SupportedHTMLElements } from "./domElements.ts";

type Prop =
  & JSX.DOMAttributes<HTMLInputElement>
  & ClassAttributes<HTMLInputElement>;

function createElement<T extends keyof JSX.IntrinsicElements>(
  tag: keyof JSX.IntrinsicElements,
  defaultStyle: string,
): React.FC<JSX.IntrinsicElements[T]> {
  const Element = (
    props: JSX.IntrinsicElements[T],
  ) => {
    const { style, children, ...restProps } = props;

    let set_style: typeof style = defaultStyle;
    if (style) {
      set_style = style;
    }

    const newProp: Prop = { style: set_style, ...restProps } as Prop;

    return createPreactElement(tag, newProp, children);
  };
  return Element;
}

interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  (defaultStyle: TemplateStringsArray): React.Fc<JSX.IntrinsicElements[T]>;
}

type Styled = {
  [T in SupportedHTMLElements]: RenderFunc<T>;
};

// deno-lint-ignore no-explicit-any
const styledTmp: any = {};

domElements.forEach((domElement) => {
  styledTmp[domElement] = (style: TemplateStringsArray) => {
    const style_css = style.join("");
    return createElement<typeof domElement>(domElement, style_css);
  };
});

const styled = styledTmp as Styled;

export { styled };
