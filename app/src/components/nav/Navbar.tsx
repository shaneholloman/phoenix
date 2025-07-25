import { ReactNode, useState } from "react";
import { Link, NavLink as RRNavLink } from "react-router";
import { css } from "@emotion/react";

import { Icon, Icons, Text } from "@phoenix/components";
import { GitHubStarCount } from "@phoenix/components/nav/GitHubStarCount";
import { useTheme, useViewer } from "@phoenix/contexts";

import { Logo, LogoText } from "./Logo";

const topNavCSS = css`
  padding: var(--ac-global-dimension-static-size-100)
    var(--ac-global-dimension-static-size-200)
    var(--ac-global-dimension-static-size-100)
    var(--ac-global-dimension-static-size-200);
  border-bottom: 1px solid var(--ac-global-color-grey-200);
  flex: none;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const sideNavCSS = css`
  padding: var(--ac-global-dimension-static-size-200)
    var(--ac-global-dimension-static-size-100);
  flex: none;
  display: flex;
  flex-direction: column;
  background-color: var(--ac-global-color-grey-75);
  border-right: 1px solid var(--ac-global-color-grey-200);
  box-sizing: border-box;
  height: 100vh;
  position: fixed;
  width: var(--px-nav-collapsed-width);
  z-index: 2; // Above the content
  transition:
    width 0.15s cubic-bezier(0, 0.57, 0.21, 0.99),
    box-shadow 0.15s cubic-bezier(0, 0.57, 0.21, 0.99);
  &[data-expanded="true"] {
    width: var(--px-nav-expanded-width);
    box-shadow: 0 0 30px 0 rgba(0, 0, 0, 0.2);
  }
  &[data-expanded="false"] {
    .brand-text-wrap {
      opacity: 0;
    }
  }
`;

const navLinkCSS = css`
  width: 100%;
  color: var(--ac-global-color-grey-500);
  background-color: transparent;
  border-radius: var(--ac-global-rounding-small);
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  transition:
    color 0.2s ease-in-out,
    background-color 0.2s ease-in-out;
  text-decoration: none;
  cursor: pointer;

  &.active {
    color: var(--ac-global-color-grey-1200);
    background-color: var(--ac-global-color-primary-200);
  }
  &:hover:not(.active) {
    color: var(--ac-global-color-grey-1200);
    background-color: var(--ac-global-color-grey-100);
  }
  & > .ac-icon-wrap {
    padding: var(--ac-global-dimension-size-50);
    display: inline-block;
  }
  .ac-text {
    padding-inline-start: var(--ac-global-dimension-size-50);
    padding-inline-end: var(--ac-global-dimension-size-100);
    white-space: nowrap;
  }
`;

const brandCSS = css`
  color: var(--ac-global-text-color-900);
  font-size: var(--ac-global-font-size-xl);
  text-decoration: none;
  margin: 0 0 var(--ac-global-dimension-static-size-200) 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--ac-global-dimension-static-size-150);
  overflow: hidden;
  & > * {
    flex: none;
  }
  .brand-text-wrap {
    opacity: 1;
    transition: all 0.8s ease-in-out;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
`;

function ExternalLink(props: {
  href: string;
  leadingVisual: ReactNode;
  trailingVisual?: ReactNode;
  text: string;
  replaceTab?: boolean;
}) {
  return (
    <a
      href={props.href}
      target={props.replaceTab ? undefined : "_blank"}
      css={navLinkCSS}
      rel="noreferrer"
    >
      {props.leadingVisual}
      <Text>{props.text}</Text>
      {props.trailingVisual}
    </a>
  );
}

export function DocsLink() {
  return (
    <ExternalLink
      href="https://arize.com/docs/phoenix"
      leadingVisual={<Icon svg={<Icons.BookOutline />} />}
      text="Documentation"
    />
  );
}

export function GitHubLink() {
  return (
    <ExternalLink
      href="https://github.com/Arize-ai/phoenix"
      leadingVisual={<Icon svg={<Icons.GitHub />} />}
      trailingVisual={<GitHubStarCount />}
      text="Star on GitHub"
    />
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      css={navLinkCSS}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="button--reset"
    >
      <Icon svg={isDark ? <Icons.MoonOutline /> : <Icons.SunOutline />} />
      <Text>{isDark ? "Dark" : "Light"}</Text>
    </button>
  );
}

export function Brand() {
  return (
    <Link
      to="/"
      css={brandCSS}
      title={`version: ${window.Config.platformVersion}`}
    >
      <Logo />
      <div className="brand-text-wrap">
        <LogoText className="brand-text" />
      </div>
    </Link>
  );
}

export function TopNavbar({ children }: { children: ReactNode }) {
  return <nav css={topNavCSS}>{children}</nav>;
}

export function SideNavbar({ children }: { children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <nav
      data-expanded={isHovered}
      css={sideNavCSS}
      onMouseOver={() => {
        setIsHovered(true);
      }}
      onMouseOut={() => {
        setIsHovered(false);
      }}
    >
      {children}
    </nav>
  );
}

export function NavLink(props: {
  to: string;
  text: string;
  leadingVisual: ReactNode;
}) {
  return (
    <RRNavLink to={props.to} css={navLinkCSS}>
      {props.leadingVisual}
      <Text>{props.text}</Text>
    </RRNavLink>
  );
}

export function NavButton(props: {
  text: string;
  leadingVisual: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="button--reset" css={navLinkCSS} onClick={props.onClick}>
      {props.leadingVisual}
      <Text>{props.text}</Text>
    </button>
  );
}

export const ManagementLink = () => {
  const { viewer } = useViewer();

  if (viewer?.isManagementUser && window.Config.managementUrl) {
    return (
      <li key="management">
        <ExternalLink
          href={window.Config.managementUrl}
          leadingVisual={<Icon svg={<Icons.Server />} />}
          text="Management Console"
          replaceTab
        />
      </li>
    );
  }
  return null;
};
