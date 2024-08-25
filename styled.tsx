import {
  type ClassAttributes,
  h as createPreactElement,
  type JSX,
} from "preact";

import type React from "react";

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
    console.log(style);

    let set_style: typeof style = defaultStyle;
    if (style) {
      set_style = style;
    }

    const newProp: Prop = { style: set_style, ...restProps } as Prop;

    return createPreactElement(tag, newProp, children);
  };
  return Element;
}

const elements = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "track",
  "u",
  "ul",
  "use",
  "var",
  "video",
  "wbr", // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan",
] as const;

export type SupportedHTMLElements = (typeof elements)[number];

interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  (defaultStyle: TemplateStringsArray): React.Fc<JSX.IntrinsicElements[T]>;
}

type Styled = {
  [T in SupportedHTMLElements]: RenderFunc<T>;
};

// deno-lint-ignore no-explicit-any
const styledTmp: any = {};

const domElements = new Set(elements);
domElements.forEach((domElement) => {
  styledTmp[domElement] = (style: TemplateStringsArray) => {
    const style_css = style.join("");
    return createElement<typeof domElement>(domElement, style_css);
  };
});

const styled = styledTmp as Styled;

export { styled };
