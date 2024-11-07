/** @jsxRuntime automatic */
/** @jsxImportSource npm:preact@^10.23.2 */

import {
  type ClassAttributes,
  h as createPreactElement,
  type JSX,
} from "preact";

import type React from "react";
import { domElements, type SupportedHTMLElements } from "./domElements.ts";

// deno-lint-ignore no-explicit-any
export function toSnakeCase<T extends Record<string, any>>(
  obj: T,
): // deno-lint-ignore no-explicit-any
Record<string, any> {
  // deno-lint-ignore no-explicit-any
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = key.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`,
    );
    newObj[snakeKey] = obj[key];
  }
  return newObj;
}

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

function generateClassName() {
  return `styled-component-${ID.next()}`;
}

function injectStyles(className: string, styles: string) {
  if (!document.querySelector(`.${className}`)) {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.${className} { ${styles} }`;
    document.head.appendChild(styleSheet);
  }
}

function injectStylesObject(className: string, styles: string) {
  if (!document.querySelector(`.${className}`)) {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.${className} ${styles}`;
    document.head.appendChild(styleSheet);
  }
}

function updateStylesCSS(className: string, styles: string) {
  if (!document.querySelector(`.${className}`)) {
    return;
  }
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    for (let j = 0; j < sheet.cssRules.length; j++) {
      const rule: CSSStyleRule = sheet.cssRules[j] as CSSStyleRule;
      if (rule.selectorText == `.${className}`) {
        sheet.deleteRule(j);
        sheet.insertRule(`.${className} { ${styles} }`, j);
        return;
      }
    }
  }
}

function createElementObject<T extends keyof JSX.IntrinsicElements>(
  tag: T,
  defaultStyleObject: object,
): React.FC<JSX.IntrinsicElements[T]> {
  let defaultStyle = JSON.stringify(toSnakeCase(defaultStyleObject), null, 2);
  defaultStyle = defaultStyle.replaceAll(",", ";");
  defaultStyle = defaultStyle.replaceAll('"', "");
  const className = generateClassName();
  const Element = (
    props: JSX.IntrinsicElements[T],
  ) => {
    const { children, ...restProps } = props;

    const newstyle = defaultStyle;
    injectStylesObject(className, newstyle);

    const newProp: Prop = {
      className: props.className || className,
      ...restProps,
    } as Prop;

    return createPreactElement(tag, newProp, children);
  };
  return Element;
}

function createElement<T extends keyof JSX.IntrinsicElements, I>(
  tag: T,
  ostyle: TemplateStringsArray,
  ...args: SupportedHtmlType[]
): React.FC<JSX.IntrinsicElements[T]> {
  const className = generateClassName();
  const Element = (
    props: JSX.IntrinsicElements[T] & I,
  ) => {
    const { children, ...restProps } = props;
    let defaultStyle = "";
    const arglen = args.length;
    ostyle.forEach((stylestr, i) => {
      if (i < arglen) {
        defaultStyle += stylestr + args[i];
      } else {
        defaultStyle += stylestr;
      }
    });
    const newstyle = defaultStyle;

    injectStyles(className, newstyle);

    const newProp: Prop = {
      className: props.className || className,
      ...restProps,
    } as Prop;

    return createPreactElement(tag, newProp, children);
  };
  return Element;
}

type IdRemember<T> = {
  mappedId: Map<T, string>;
};

type StoredFun<T extends keyof JSX.IntrinsicElements, I> =
  & React.FC<JSX.IntrinsicElements[T]>
  & IdRemember<I>;

type ElementCallBackFun<I> = (input: I) => SupportedHtmlType;

function isSupportElementArray<I>(
  arr: ElementCallBackFun<I>[] | SupportedHtmlType[],
): arr is SupportedHtmlType[] {
  if (arr.length == 0) {
    return true;
  }
  return typeof arr[0] !== "function"; // Check if the first arg is function
}

/**
 * This allow to define a prop with styled-components
 */
function createElementWithProps<T extends keyof JSX.IntrinsicElements, I>(
  tag: T,
  ostyle: TemplateStringsArray,
  ...args: ElementCallBackFun<I>[] | SupportedHtmlType[]
): React.FC<JSX.IntrinsicElements[T]> {
  if (isSupportElementArray<I>(args)) {
    return createElement<T, I>(tag, ostyle, ...args);
  }

  const ElementTmp: StoredFun<T, I> = Object.assign((
    props: JSX.IntrinsicElements[T] & I,
  ) => {
    let defaultStyle = "";
    const arglen = args.length;
    ostyle.forEach((stylestr, i) => {
      if (i < arglen) {
        defaultStyle += stylestr + args[i](props);
      } else {
        defaultStyle += stylestr;
      }
    });
    const { children, ...restProps } = props;

    // NOTE: cached the id
    let className: string | undefined = ElementTmp.mappedId.get(props as I);

    if (!className) {
      className = generateClassName();
      injectStyles(className, defaultStyle);
      ElementTmp.mappedId.set(props as I, className);
    }

    const newProp: Prop = {
      className: props.className || className,
      ...restProps,
    } as Prop;

    return createPreactElement(tag, newProp, children);
  }, { mappedId: new Map() });

  return ElementTmp;
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

      const className = generateClassName();
      injectStyles(className, defaultStyle);

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

type SupportedHtmlType = string | number;

interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  <I>(
    defaultStyle: TemplateStringsArray | object,
    ...args: ElementCallBackFun<I>[] | SupportedHtmlType[]
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
  styledTmp[domElement] = function <I,>(
    style: TemplateStringsArray | object,
    ...args: ElementCallBackFun<I>[] | SupportedHtmlType[]
  ) {
    // it is TemplateStringsArray
    if (Array.isArray(style) && "raw" in style) {
      return createElementWithProps<typeof domElement, I>(
        domElement,
        style as TemplateStringsArray,
        ...args,
      );
    }
    return createElementObject<typeof domElement>(domElement, style);
  };
});

/**
 * This is similar with styled in styled-components but for deno.
 *
 * You can take reference at styled-components from npm
 */
const styled = styledTmp as Styled;

type DynamicCSSFn<T> =
  & ((
    props: T,
  ) => string)
  & {
    className: string | undefined;
  };

/**
 * dynamicCSS, whose style can be changed in runtime
 *
 * @example
 * ```typescript
 * import { dynamicCSS } from "@nobody/styled-components-deno";
 * import { useRef, useState } from "preact/hooks";
 * type WindowPosition = {
 *   x: number;
 *   y: number;
 * };
 *
 * const Window = dynamicCSS<WindowPosition>`
 *   width: 400px;
 *   height: 200px;
 *   position: absolute;
 *   top: ${(prop) => `${prop.y}px`};
 *   left: ${(prop) => `${prop.x}px`};
 *   border: 1px solid #ccc;
 *   background-color: #f1f1f1;
 *   cursor: move;
 * `;
 * function MovedWindow() {
 *  const [windowPos, setWindowPos] =useState<WindowPosition>({x: 0, y: 0});
 *  const windowRef = useRef<HTMLDivElement>(null);
 *
 *  const handleMouseDown = (e: MouseEvent) => {
 *    const windowElement = windowRef.current;
 *    if (!windowElement) {
 *      return;
 *    }
 *
 *    const offsetX = e.clientX - windowElement.offsetLeft;
 *    const offsetY = e.clientY - windowElement.offsetTop;
 *
 *    const handleMouseMove = (moveEvent: MouseEvent) => {
 *      const left = moveEvent.clientX - offsetX;
 *      const top = moveEvent.clientY - offsetY;
 *      setWindowPos({ x: left, y: top });
 *    };
 *
 *    const handleMouseUp = () => {
 *      document.removeEventListener("mousemove", handleMouseMove);
 *      document.removeEventListener("mouseup", handleMouseUp);
 *    };
 *
 *    document.addEventListener("mousemove", handleMouseMove);
 *    document.addEventListener("mouseup", handleMouseUp);
 *  };
 *
 *  return (
 *    <div
 *      ref={windowRef}
 *      className={Window(windowPos)}
 *      onMouseDown={handleMouseDown}
 *    >
 *    </div>
 *  );
 * }
 * ```
 */
function dynamicCSS<T>(
  ostyle: TemplateStringsArray,
  ...args: ((input: T) => SupportedHtmlType)[]
): DynamicCSSFn<T> {
  const FunTmp: DynamicCSSFn<T> = Object.assign((props: T) => {
    let defaultStyle = "";
    const arglen = args.length;
    ostyle.forEach((stylestr, i) => {
      if (i < arglen) {
        defaultStyle += stylestr + args[i](props);
      } else {
        defaultStyle += stylestr;
      }
    });

    let className: string | undefined = undefined;
    if (FunTmp.className) {
      className = FunTmp.className;
      updateStylesCSS(className, defaultStyle);
    } else {
      className = generateClassName();
      FunTmp.className = className;
      injectStyles(className, defaultStyle);
    }

    return FunTmp.className;
  }, { className: undefined });
  return FunTmp;
}

/**
 * This one is used to create a stylesheet, what is return is css
 * This one will never change when created
 */
function css(
  ostyle: TemplateStringsArray,
  ...args: SupportedHtmlType[]
): string {
  const className = generateClassName();
  let defaultStyle = "";
  const arglen = args.length;
  ostyle.forEach((stylestr, i) => {
    if (i < arglen) {
      defaultStyle += stylestr + args[i];
    } else {
      defaultStyle += stylestr;
    }
  });

  injectStyles(className, defaultStyle);

  return className;
}

export { css, dynamicCSS, styled };

export type { DynamicCSSFn };
