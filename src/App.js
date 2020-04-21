import { useStickyroll } from "@stickyroll/hooks";
import { scrollTo } from "@stickyroll/utils";
import React from "react";
import styled, { css, createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    font-family: sans-serif;
  }
`;

const PagerWrapper = styled.label`
  position: relative;
  display: block;
  height: 2em;
  width: 2em;
  background: none;
  border-radius: 50%;
  overflow: hidden;
`;

const PagerDot = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  height: 1em;
  width: 1em;
  background: white;
  border: 2px solid black;
  border-radius: 50%;
`;

const PagerInput = styled.input.attrs({ type: "radio" })`
  position: absolute;
  top: 50%;
  right: 100%;
  transform: translateY(-50%);

  &:checked + ${PagerDot} {
    background: black;
  }
  &:focus + ${PagerDot} {
    box-shadow: 0 0 0 2px black;
  }
`;

const Pager = ({ href, children, className, active, ...props }) => {
  const handleChange = e => {
    e.preventDefault();
    const id = href.replace(/^#/, "");
    scrollTo(id, e.target);
  };

  return (
    <PagerWrapper>
      <PagerInput {...props} onChange={handleChange} checked={active} />
      <PagerDot />
    </PagerWrapper>
  );
};

const Progress = styled.span`
  position: absolute;
  top: 0.5em;
  left: 50%;
  bottom: 0.5em;
  background: black;
  width: 2px;
  margin-left: -1px;
  transform-origin: 50% 0;
`;

const Triggers = styled.nav`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
`;

const Content = styled.div`
  position: sticky;
  top: 0;
  padding: 1rem;
  height: 100vh;
  z-index: 1;
`;

const Targets = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
`;

const Target = styled.div`
  display: block;
  height: 100vh;
  scroll-snap-align: start;
`;

const Wrapper = styled.div`
  ${props =>
    css`
      height: ${props.height};
    `};
  position: relative;
`;

function Pagers({ triggers, pageCount, progress, pageIndex }) {
  return (
    <Triggers>
      <Progress
        style={{
          transform: `scale3d(1,${(1 / pageCount) * (pageIndex + progress)},1)`
        }}
      />
      {triggers.map(trigger => (
        <Pager key={trigger.href} href={trigger.href} active={trigger.active} />
      ))}
    </Triggers>
  );
}

function Pages({ targets }) {
  return (
    <Targets>
      {targets.map(target => (
        <Target id={target.id} key={target.id} style={target.style} />
      ))}
    </Targets>
  );
}

function range(n) {
  return Array(n)
    .fill(Boolean)
    .map((x, i) => i + 1);
}

function useAnchors({ name, factor = 1, pageCount, pageIndex }) {
  const glue = name.length ? "/" : "";
  const items = range(pageCount + 1);
  const targets = items.map(n => ({
    id: `${name}${glue}${n}`,
    style: {
      height: `${100 * factor}vh`
    }
  }));
  const triggers = items.map((n, i) => ({
    href: `#${name}${glue}${n}`,
    active: i === pageIndex
  }));
  return { targets, triggers, name };
}

function App() {
  const [
    wrapper,
    { height, currentPage, pageCount, pageIndex, progress }
  ] = useStickyroll({
    pages: 3
  });

  // start patches
  const actualPage = Math.min(pageCount, currentPage);
  const actualProgress = pageCount > currentPage - 1 ? progress : 1;
  // end patches

  const { targets, triggers } = useAnchors({
    name: "",
    pageCount,
    pageIndex,
    progress: actualProgress
  });

  return (
    <React.Fragment>
      <GlobalStyle />
      <Wrapper ref={wrapper} height={height}>
        <Content>
          <Pagers
            triggers={triggers}
            pageCount={pageCount}
            progress={progress}
            pageIndex={pageIndex}
          />
          Page {actualPage} of {pageCount}
          <br />
          Progress: {Math.round(actualProgress * 100)}%
        </Content>
        <Pages targets={targets} />
      </Wrapper>
    </React.Fragment>
  );
}

export default App;
