import {
  type ClassAttributes,
  type DOMAttributes,
  type FunctionalComponent,
  h as createPreactElement,
  type JSX,
} from "preact";

import { domElements, type SupportedHTMLElements } from "./domElements.ts";
import type {
  ElementCallBackFun,
  FollowedClassName,
  RenderFunc,
  StyledElement,
  SupportedHtmlType,
} from "./types.ts";

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
  & DOMAttributes<HTMLInputElement>
  & ClassAttributes<HTMLInputElement>;

function generateClassName() {
  return `styled-component-${ID.next()}`;
}

function queryClassName(className: string): boolean {
  const styles = document.styleSheets;
  for (const style of styles) {
    for (const rule of style.cssRules) {
      // HACK: make sure there is a space
      if (rule.cssText.includes(`.${className} `)) {
        return true;
      }
    }
  }
  return false;
}

function injectStyles(className: string, styles: string) {
  if (!queryClassName(className)) {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.${className} { ${styles} }`;
    document.head.appendChild(styleSheet);
  }
}

function injectStylesObject(className: string, styles: string) {
  if (!queryClassName(className)) {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `.${className} ${styles}`;
    document.head.appendChild(styleSheet);
  }
}

function updateStylesCSS(className: string, styles: string) {
  if (!queryClassName(className)) {
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
): StyledElement<T> {
  let defaultStyle = JSON.stringify(toSnakeCase(defaultStyleObject), null, 2);
  defaultStyle = defaultStyle.replaceAll(",", ";");
  defaultStyle = defaultStyle.replaceAll('"', "");
  const className = generateClassName();
  const Element: StyledElement<T> = Object.assign((
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
  }, { className });
  return Element;
}

function createElement<T extends keyof JSX.IntrinsicElements, I>(
  tag: T,
  ostyle: TemplateStringsArray,
  ...args: SupportedHtmlType[]
): StyledElement<T, I> {
  const className = generateClassName();
  const Element: StyledElement<T, I> = Object.assign((
    props: JSX.IntrinsicElements[T],
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
      className: props.className?.toString() || className,
      ...restProps,
    } as Prop;

    return createPreactElement(tag, newProp, children);
  }, { className });
  return Element;
}

type IdRemember<T> = {
  mappedId: Map<T, string>;
};

type StoredFun<T extends keyof JSX.IntrinsicElements, I> =
  & StyledElement<T, I>
  & IdRemember<I>;

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
): StyledElement<T, I> {
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

  return ElementTmp as StyledElement<T, I>;
}

/*
 * This require the function input parma contains a className input to work
 */
function recreateElement<T extends keyof JSX.IntrinsicElements, I>(
  component: FunctionalComponent<I> & FollowedClassName,
): (
  style: TemplateStringsArray,
  ...args: SupportedHtmlType[]
) => StyledElement<T, I> {
  return (style: TemplateStringsArray, ...args: SupportedHtmlType[]) => {
    let defaultStyle = "";
    const arglen = args.length;
    style.forEach((stylestr, i) => {
      if (i < arglen) {
        defaultStyle += stylestr + args[i];
      } else {
        defaultStyle += stylestr;
      }
    });
    let newclassName = generateClassName();
    if (component.className) {
      newclassName = `${component.className} ${newclassName}`;
    }
    const Element: StyledElement<T, I> = Object.assign((
      props: JSX.IntrinsicElements[T] & I,
    ) => {
      const { children, ...restProps } = props;

      injectStyles(newclassName, defaultStyle);

      const className = props.className?.toString() || newclassName;
      const newProps = {
        className,
        ...restProps,
        // deno-lint-ignore no-explicit-any
      } as any;
      return createPreactElement(component, newProps, children);
    }, { className: newclassName });
    return Element;
  };
}

type Styled =
  & typeof recreateElement
  & {
    [T in SupportedHTMLElements]: RenderFunc<T>;
  };

// deno-lint-ignore no-explicit-any
const styledTmp: any = recreateElement;

domElements.forEach((domElement) => {
  styledTmp[domElement] = function <I>(
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

class AttributeGroup<T extends readonly string[]> {
  keys: T;
  private _groupName: string;
  private _baseCSS: string = "";
  maps: Map<string, string> = new Map();
  constructor(keys: T) {
    this.keys = keys;
    for (const key in keys) {
      this.maps.set(key, "");
    }
    this._groupName = generateClassName();
  }

  initBaseCSS(baseCSS: TemplateStringsArray) {
    const base = baseCSS.join(" ");
    this._baseCSS = base;
  }

  init(initfn: (key: T[number]) => string) {
    for (const key in this.keys) {
      const css = initfn(key);
      this.maps.set(key, css);
    }
  }

  setCSS(
    key: T[number],
  ): (css: TemplateStringsArray, ...args: SupportedHtmlType[]) => void {
    return (ostyle: TemplateStringsArray, ...args: SupportedHtmlType[]) => {
      let targetCSS = "";
      const arglen = args.length;
      ostyle.forEach((stylestr, i) => {
        if (i < arglen) {
          targetCSS += stylestr + args[i];
        } else {
          targetCSS += stylestr;
        }
      });

      this.maps.set(key, targetCSS);
    };
  }

  get groupName(): string {
    return this._groupName;
  }

  // Final need to run generate to insert the styles
  generate() {
    let innerHTML = `.${this._groupName} { ${this._baseCSS} }\n`;

    this.keys.forEach((key, _) => {
      const injectName = `.${this._groupName}[${key}]`;
      innerHTML += `${injectName} { ${this.maps.get(key)!} }\n`;
    });
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = innerHTML;
    document.head.appendChild(styleSheet);
  }
}

function setAnimation(
  name: string,
): (css: TemplateStringsArray, ...args: SupportedHtmlType[]) => void {
  return (ostyle: TemplateStringsArray, ...args: SupportedHtmlType[]) => {
    let targetCSS = "";
    const arglen = args.length;
    ostyle.forEach((stylestr, i) => {
      if (i < arglen) {
        targetCSS += stylestr + args[i];
      } else {
        targetCSS += stylestr;
      }
    });
    const innerHTML = `@keyframes ${name} { ${targetCSS} }\n`;
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = innerHTML;
    document.head.appendChild(styleSheet);
  };
}

class StyleGroup<T extends readonly string[]> {
  keys: T;
  _mainKey: T[number];
  maps: Map<string, string> = new Map();
  constructor(keys: T, mainKey: T[number]) {
    this.keys = keys;
    this._mainKey = mainKey;
    for (const key in keys) {
      this.maps.set(key, "");
    }
  }

  init(initfn: (key: T[number]) => string) {
    for (const key in this.keys) {
      const css = initfn(key);
      this.maps.set(key, css);
    }
  }

  setCSS(
    key: T[number],
  ): (css: TemplateStringsArray, ...args: SupportedHtmlType[]) => void {
    return (ostyle: TemplateStringsArray, ...args: SupportedHtmlType[]) => {
      let targetCSS = "";
      const arglen = args.length;
      ostyle.forEach((stylestr, i) => {
        if (i < arglen) {
          targetCSS += stylestr + args[i];
        } else {
          targetCSS += stylestr;
        }
      });

      this.maps.set(key, targetCSS);
    };
  }

  get mainKey(): T[number] {
    return this._mainKey;
  }

  generate(): {
    [K in T[number]]: string;
  } {
    const result = {} as {
      [key: string]: string;
    };
    let innerHTML = "";

    this.keys.forEach((key, _) => {
      result[key] = key; // Example logic
      let injectName = `.${result[key]}`;
      if (key != this.mainKey) {
        injectName = `.${this.mainKey}.${key}`;
      }
      innerHTML += `${injectName} { ${this.maps.get(key)!} }\n`;
    });
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = innerHTML;
    document.head.appendChild(styleSheet);

    return result as { [K in T[number]]: string };
  }
}

export { AttributeGroup, css, dynamicCSS, setAnimation, styled, StyleGroup };

export type { DynamicCSSFn };
