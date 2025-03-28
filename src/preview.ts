/**
 * A decorator is a way to wrap a story in extra “rendering” functionality. Many addons define decorators
 * in order to augment stories:
 * - with extra rendering
 * - gather details about how a story is rendered
 *
 * When writing stories, decorators are typically used to wrap stories with extra markup or context mocking.
 *
 * https://storybook.js.org/docs/react/writing-stories/decorators
 */
import type { Renderer, ProjectAnnotations } from "@storybook/types";
import { PARAM_KEY } from "./constants";
import { withRunner } from "./withRunner";

/**
 * Note: if you want to use JSX in this file, rename it to `preview.tsx`
 * and update the entry prop in tsup.config.ts to use "src/preview.tsx",
 */

const preview: ProjectAnnotations<Renderer> = {
  // decorators: [withGlobals, withRoundTrip],
  decorators: [withRunner], // 여기에 withRunner 씌운 순간.iframe에서 로드가 된다
  globals: {
    [PARAM_KEY]: false,
  },
};

export default preview;
