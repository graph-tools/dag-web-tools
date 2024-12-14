import React, { InputHTMLAttributes, PropsWithChildren } from 'react';
import cn from 'classnames';

import S from './index.module.css';

export const Checkbox = ({
  disabled,
  style,
  className,
  children,
  ...other
}: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) => {
  return (
    <label
      data-disabled={disabled}
      style={style}
      className={cn(S.checkbox, className)}
    >
      <input
        type="checkbox"
        className={S.input}
        disabled={disabled}
        {...other}
      />
      {children}
    </label>
  );
};
