import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import * as T from './types';
import S from './index.module.css';

const Wrapper = ({
  className,
  children,
}: PropsWithChildren<T.NavigationProps>) => (
  <nav className={cn(S.navigation, className)}>{children}</nav>
);

const Group = ({ title, children }: PropsWithChildren<T.GroupProps>) => (
  <>
    <h1 className={S.title}>{title}</h1>
    <ul className={S.items}>{children}</ul>
  </>
);

const Item = ({ logo, href, children }: PropsWithChildren<T.ItemProps>) => (
  <Link to={href} className={S.link}>
    <li className={S.item}>
      <img className={S.icon} src={logo} />
      <p className={S.text}>{children}</p>
    </li>
  </Link>
);

export const Navigation = Object.assign(Wrapper, { Group, Item });

export * from './types';
