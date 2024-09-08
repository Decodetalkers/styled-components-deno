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
  const Element = (
    props: JSX.IntrinsicElements[T],
  ) => {
    const { children, ...restProps } = props;

    const newstyle = defaultStyle;
    const className = generateClassName();
    injectStylesObject(className, newstyle);

    const newProp: Prop = {
      className: props.className || className,
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
    const { children, ...restProps } = props;

    const newstyle = defaultStyle;
    const className = generateClassName();
    injectStyles(className, newstyle);

    const newProp: Prop = {
      className: props.className || className,
      ...restProps,
    } as Prop;

    return createPreactElement(tag, newProp, children);
  };
  return Element;
}

/**
 * This allow to define a prop with styled-components
 */
function createElementWithProps<T extends keyof JSX.IntrinsicElements, I>(
  tag: T,
  ostyle: TemplateStringsArray,
  ...args: ((input: I) => SupportedHtmlType)[]
): React.FC<JSX.IntrinsicElements[T]> {
  const Element = (
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

    const className = generateClassName();
    injectStyles(className, defaultStyle);

    const newProp: Prop = {
      className: props.className || className,
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
    ...args: ((input: I) => SupportedHtmlType)[]
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
    ...args: ((input: I) => SupportedHtmlType)[]
  ) {
    // it is TemplateStringsArray
    if (Array.isArray(style) && "raw" in style) {
      if (args.length == 0) {
        const style_css = style.join("");
        return createElement<typeof domElement>(domElement, style_css);
      } else {
        return createElementWithProps<typeof domElement, I>(
          domElement,
          style as TemplateStringsArray,
          ...args,
        );
      }
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

type DynamicCSSFnResult<T> = {
  className: string;
  updateStyle: (props: T) => void;
};

type DynamicCSSFn<T> = (
  props: T,
) => DynamicCSSFnResult<T>;

/** @module
 * dynamicCSS, whose style can be changed in runtime
 *
 * @example
 * ```typescript
 * import { dynamicCss } from "@nobody/styled-components-deno";
 * type WindowPosition = {
 *   x: number;
 *   y: number;
 * };
 *
 * const Window = dynamicCss<WindowPosition>`
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
 *  const windowRef = useRef<HTMLDivElement>(null);
 *
 *  const lostyle = Window({ x: 0, y: 0 });
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
 *      lostyle.updateStyle({ x: left, y: top });
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
 *      className={lostyle.className}
 *      onMouseDown={handleMouseDown}
 *    >
 *      <Title3>I am a draggable component, use dynamicCss</Title3>
 *    </div>
 *  );
 * }
 * ```
 */
function dynamicCSS<T>(
  ostyle: TemplateStringsArray,
  ...args: ((input: T) => SupportedHtmlType)[]
): DynamicCSSFn<T> {
  const localupdateStyle = (className: string, props: T): void => {
    let defaultStyle = "";
    const arglen = args.length;
    ostyle.forEach((stylestr, i) => {
      if (i < arglen) {
        defaultStyle += stylestr + args[i](props);
      } else {
        defaultStyle += stylestr;
      }
    });
    updateStylesCSS(className, defaultStyle);
  };

  return (props: T) => {
    let defaultStyle = "";
    const arglen = args.length;
    ostyle.forEach((stylestr, i) => {
      if (i < arglen) {
        defaultStyle += stylestr + args[i](props);
      } else {
        defaultStyle += stylestr;
      }
    });

    const className = generateClassName();

    injectStyles(className, defaultStyle);

    return {
      className,
      updateStyle: (props: T) => localupdateStyle(className, props),
    };
  };
}

export { dynamicCSS, styled };

export type { DynamicCSSFn, DynamicCSSFnResult };
