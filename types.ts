export type SupportedHtmlType = string | number;
import type { FunctionalComponent, JSX } from "preact";

// This defined the className binding with a FunctionalComponent
export type FollowedClassName = {
  // This just suggested className. If you defined it yourself, you should use that one
  className?: string;
};

// This defined the className binding with a React.Fc
export type StyledElement<T extends keyof JSX.IntrinsicElements, I = unknown> =
  & FunctionalComponent<JSX.IntrinsicElements[T] & I>
  & FollowedClassName;

// supported callback function type
export type ElementCallBackFun<I> = (input: I) => SupportedHtmlType;

// The type of the function on the styled
export interface RenderFunc<T extends keyof JSX.IntrinsicElements> {
  <I>(
    defaultStyle: TemplateStringsArray | object,
    ...args: ElementCallBackFun<I>[] | SupportedHtmlType[]
  ): StyledElement<T, I>;
}
