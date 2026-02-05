import type { PropsWithChildren } from 'react';

type LayoutProps = PropsWithChildren;

const Layout = ({ children }: LayoutProps) => <div className="app-shell">{children}</div>;

export default Layout;

