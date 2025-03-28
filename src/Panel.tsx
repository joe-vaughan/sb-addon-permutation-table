import React, { SyntheticEvent, useEffect, useState } from "react";
import {
  useAddonState,
  useArgs,
  useArgTypes,
  useChannel,
  useParameter,
  useStorybookApi,
  useStorybookState,
} from "@storybook/manager-api";
import { AddonPanel, Placeholder } from "@storybook/components";
import { ADDON_ID, EVENTS } from "./constants";
import { CodeEditor } from "./components/CodeEditor";
import { styled } from "@storybook/theming";

import { LiveProps, StorySource, Options } from "./types";
import { PARAM_KEY, SOURCE_KEY, PER_STATE } from "./constants";
import { sourceCodeWithArgPermutations } from "./tools";
import { ArgTable } from "./components/ArgTable";
import { Showcase } from "./components/Showcase";
import { CopyButton, Tray } from "./components/actionTray";
import { NoSource } from "./components/NoSource";
import { API_LeafEntry } from "@storybook/types";
import { isStoryReady } from "./utils/storybook";

const stopPropagation = (event: SyntheticEvent) => {
  event.stopPropagation();
};

interface PanelProps {
  key: string;
  active: boolean;
  [x: string]: any;
}

const Container = styled.div`
  padding: 10px;
  min-width: fit-content;
  margin: 0 auto;
  height: 100%; // XXX:
`;

const Nav = styled.div`
  border-bottom: 1px solid white;
  text-align: end;
  width: 100%;
  position: relative;
  height: 40px;
`;

const Display = styled.div`
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    background-color: transparent;
  }

  &::-webkit-scrollbar {
    width: 7px;
    background-color: #323232;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #555;
  }
  height: 200px;
  overflow: auto;
  background: #2d2d2d;
`;

export const Panel: React.FC<PanelProps> = (props) => {
  const source = useParameter<StorySource | undefined>(SOURCE_KEY)?.source;
  const importPath = useParameter<StorySource | undefined>(
    SOURCE_KEY
  )?.importPath;

  const [permutations, setPermutations] = useAddonState<string[]>(
    PER_STATE,
    []
  );

  const [args, updateArgs, resetArgs] = useArgs();
  const states = useStorybookState();
  const api = useStorybookApi();
  const argTypes = useArgTypes();

  const sourceCode = sourceCodeWithArgPermutations(
    source,
    argTypes,
    args,
    permutations
  );

  useChannel({
    [EVENTS.SET_PERMUTATIONS]: (newValue: string, command?: string) => {
      setPermutations((pre) => {
        if (command === "clear") return [];
        if (command === "remove")
          return pre.filter((item) => item !== newValue);
        if (pre.includes(newValue)) {
          return pre.filter((item) => item !== newValue);
        } else {
          return [...pre, newValue];
        }
      });
    },
    [EVENTS.TABLE_ENTER]: (target: string) => {
      const targetElem = document.querySelector(`[data-value="${target}"]`);
      targetElem.classList.add("--active");
      targetElem.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    },
    [EVENTS.TABLE_LEAVE]: (target: string) => {
      document
        .querySelector(`[data-value="${target}"]`)
        .classList.remove("--active");
    },
  });

  useEffect(() => {
    if (source && args) {
      resetArgs();
    }
    setPermutations(() => []);
  }, [states.path]);

  const options = useParameter<Options | undefined>(PARAM_KEY);
  const storyId = useStorybookState().storyId;
  const data = api.getData(storyId);

  if (!states?.selectedPanel?.includes(ADDON_ID)) return undefined;

  if (!isStoryReady(data)) return <Placeholder>Initializing..</Placeholder>;

  if (!source)
    return (
      <Container>
        <NoSource />
      </Container>
    );

  return (
    <AddonPanel {...props}>
      <Container>
        <Nav>
          <Tray>
            <CopyButton
              copyText={importPath}
              clickTitle="Copied on clipboard!"
              label="Copy Import String"
            />
          </Tray>
        </Nav>
        <Display>
          {sourceCode.length <= 1 ? (
            <div style={{ position: "relative" }}>
              <CodeEditor
                key={sourceCode[0]}
                theme={options?.theme}
                language={options?.language}
                readOnly={options?.readOnly}
                defaultValue={sourceCode[0]}
                onKeyDown={stopPropagation}
                disabled={true}
              />
              <Tray>
                <CopyButton
                  hoverTitle="Click to copy"
                  clickTitle="Copied on clipboard!"
                  copyText={sourceCode[0]}
                />
              </Tray>
            </div>
          ) : (
            <Showcase sourceCode={sourceCode} />
          )}
        </Display>
        <ArgTable />
      </Container>
    </AddonPanel>
  );
};
