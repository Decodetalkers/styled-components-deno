/** @jsxRuntime automatic */
/** @jsxImportSource npm:preact@^10.23.2 */

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
  tag: T,
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

function recreateElement<T extends keyof JSX.IntrinsicElements>(
  Component: React.FC<JSX.IntrinsicElements[T]>,
): React.FC<JSX.IntrinsicElements[T]> {
  return (style: TemplateStringsArray) => {
    const defaultStyle = style.join("");
    const Element = (
      props: JSX.IntrinsicElements[T],
    ) => {
      const { style, children, ...restProps } = props;

      let set_style: typeof style = defaultStyle;
      if (style) {
        set_style = style;
      }
      const newProps: Prop = { style: set_style, ...restProps } as Prop;
      return (
        <div style={set_style}>
          <Component style={set_style} {...newProps}>{children}</Component>
        </div>
      );
    };
    return Element;
  };
}

interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  (defaultStyle: TemplateStringsArray): React.Fc<JSX.IntrinsicElements[T]>;
}

type Styled =
  & typeof recreateElement
  & {
    [T in SupportedHTMLElements]: RenderFunc<T>;
  };

// deno-lint-ignore no-explicit-any
const styledTmp: any = recreateElement;

domElements.forEach((domElement) => {
  styledTmp[domElement] = (style: TemplateStringsArray) => {
    const style_css = style.join("");
    return createElement<typeof domElement>(domElement, style_css);
  };
});

const styled = styledTmp as Styled;

export { styled };
