import type React from "react";

export type SupportedHtmlType = string | number;
import type { JSX } from "preact";

// This defined the className binding with a React.Fc
export type FollowedClassName = {
  className?: string;
};

// This defined the className binding with a React.Fc
export type StyledElement<T extends keyof JSX.IntrinsicElements> =
  & React.FC<JSX.IntrinsicElements[T]>
  & FollowedClassName;

// supported callback function type
export type ElementCallBackFun<I> = (input: I) => SupportedHtmlType;

// The type of the function on the styled
export interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  <I>(
    defaultStyle: TemplateStringsArray | object,
    ...args: ElementCallBackFun<I>[] | SupportedHtmlType[]
  ): StyledElement<T>;
}
