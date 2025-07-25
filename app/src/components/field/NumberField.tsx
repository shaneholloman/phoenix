import { forwardRef, Ref } from "react";
import {
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
} from "react-aria-components";
import { css } from "@emotion/react";

import { classNames } from "@arizeai/components";

import { fieldBaseCSS } from "@phoenix/components/field/styles";
import { SizingProps } from "@phoenix/components/types";

import { textFieldCSS } from "./styles";

export interface NumberFieldProps extends AriaNumberFieldProps, SizingProps {}

const numberFieldCSS = css`
  .react-aria-Input {
    text-align: right;
  }
`;

const NumberField = forwardRef(function NumberField(
  props: NumberFieldProps,
  ref: Ref<HTMLDivElement>
) {
  const { size = "M", ...otherProps } = props;
  return (
    <AriaNumberField
      data-size={size}
      {...otherProps}
      className={classNames(
        "ac-textfield react-aria-NumberField",
        props.className
      )}
      ref={ref}
      css={css(fieldBaseCSS, textFieldCSS, numberFieldCSS)}
    />
  );
});

export { NumberField };
