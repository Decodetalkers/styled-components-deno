/** @jsxRuntime automatic */
/** @jsxImportSource npm:preact@^10.23.2 */

import {
  type ClassAttributes,
  h as createPreactElement,
  type JSX,
} from "preact";

import type React from "react";
import { domElements, type SupportedHTMLElements } from "./domElements.ts";

class UniqueUid {
  uid: number = 0;
  constructor(uid?: number) {
    if (uid) {
      this.uid = uid;
    }
  }
  next(): number {
    return ++this.uid;
  }
}

const ID = new UniqueUid();

type Prop =
  & JSX.DOMAttributes<HTMLInputElement>
  & ClassAttributes<HTMLInputElement>;

type Style =
  | string
  | JSX.CSSProperties
  | undefined
  | JSX.SignalLike<string | JSX.CSSProperties | undefined>;

function generateClassName() {
  return `styled-component-${ID.next()}`;
}

function injectStyles(className: string, styles: Style) {
  if (!document.querySelector(`.${className}`)) {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.${className} { ${styles} }`;
    document.head.appendChild(styleSheet);
  }
}

function injectStylesObject(className: string, styles: Style) {
  if (!document.querySelector(`.${className}`)) {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.${className} ${styles}`;
    document.head.appendChild(styleSheet);
  }
}

function createElementObject<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  defaultStyleObject: object,
): React.FC<JSX.IntrinsicElements[T]> {
  let defaultStyle = JSON.stringify(defaultStyleObject, null, 2);
  defaultStyle = defaultStyle.replaceAll(",", ";");
  defaultStyle = defaultStyle.replaceAll('"', "");
  const Element = (
    props: JSX.IntrinsicElements[T],
  ) => {
    const { style, children, ...restProps } = props;

    const newstyle = style || defaultStyle;
    const className = generateClassName();
    injectStylesObject(className, newstyle);

    const newProp: Prop = {
      className: props.className || className,
      style,
      ...restProps,
    } as Prop;

    return createPreactElement(tag, newProp, children);
  };
  return Element;
}

function createElement<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  defaultStyle: string,
): React.FC<JSX.IntrinsicElements[T]> {
  const Element = (
    props: JSX.IntrinsicElements[T],
  ) => {
    const { style, children, ...restProps } = props;

    const newstyle = style || defaultStyle;
    const className = generateClassName();
    injectStyles(className, newstyle);

    const newProp: Prop = {
      className: props.className || className,
      style,
      ...restProps,
    } as Prop;

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

      const newstyle = style || defaultStyle;
      const className = generateClassName();
      injectStyles(className, newstyle);

      const newProps: Prop = {
        className: props.className || className,
        style,
        ...restProps,
      } as Prop;

      return (
        <div className={className}>
          <Component {...newProps}>{children}</Component>
        </div>
      );
    };
    return Element;
  };
}

interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  (
    defaultStyle: TemplateStringsArray | object,
  ): React.Fc<JSX.IntrinsicElements[T]>;
}

type Styled =
  & typeof recreateElement
  & {
    [T in SupportedHTMLElements]: RenderFunc<T>;
  };

// deno-lint-ignore no-explicit-any
const styledTmp: any = recreateElement;

domElements.forEach((domElement) => {
  styledTmp[domElement] = (style: TemplateStringsArray | object) => {
    if (Array.isArray(style) && "raw" in style) {
      const style_css = style.join("");
      return createElement<typeof domElement>(domElement, style_css);
    }
    return createElementObject<typeof domElement>(domElement, style);
  };
});

/**
 * @module
 * This is similar with styled in styled-components but for deno.
 *
 * You can take reference at styled-components from npm
 */
const styled = styledTmp as Styled;

export { styled };
