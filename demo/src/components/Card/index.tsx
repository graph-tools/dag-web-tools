import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import * as T from './types';
import S from './index.module.css';

const Wrapper = ({ children, className }: PropsWithChildren<T.CardProps>) => (
  <div className={cn(S.card, className)}>
    <div>
      <Link to={'..'}>Back</Link>
    </div>
    {children}
  </div>
);

const Title = ({ children }: PropsWithChildren) => (
  <h1 className={S.title}>{children}</h1>
);

const DemoSection = ({
  status,
  disabled,
  onClick,
  children,
}: PropsWithChildren<T.DemoSectionProps>) => (
  <div
    data-disabled={disabled || !onClick}
    tabIndex={disabled ? -1 : 0}
    className={S.demo}
    onClick={(e) => !disabled && e.target === e.currentTarget && onClick?.()}
  >
    <div className={S.demoContent}>
      <p className={S.demoTitle}>Try It!</p>
      {children}
      <div className={S.demoStatusBar}>
        <p className={S.demoStatus}>
          Click to: <b>{status}</b>
        </p>
      </div>
    </div>
  </div>
);

const Params = ({ children }: PropsWithChildren) => (
  <ul className={S.params}>{children}</ul>
);

const Param = ({
  done,
  required,
  children,
}: PropsWithChildren<T.DemoParamProps>) => (
  <li
    data-done={!required || (required && done)}
    data-required={required}
    className={S.param}
  >
    {children}
  </li>
);

export const Card = Object.assign(Wrapper, {
  Title,
  DemoSection,
  Params,
  Param,
});
