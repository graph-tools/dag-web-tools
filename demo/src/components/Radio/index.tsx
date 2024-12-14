import React, { InputHTMLAttributes, PropsWithChildren } from 'react';
import cn from 'classnames';

import S from './index.module.css';

export const Radio = ({
  disabled,
  style,
  className,
  children,
  ...other
}: PropsWithChildren<InputHTMLAttributes<HTMLInputElement>>) => {
  return (
    <label
      style={style}
      className={cn(S.radio, className, { [S.disabled]: disabled })}
    >
      <input type="radio" className={S.input} disabled={disabled} {...other} />
      {children}
    </label>
  );
};
