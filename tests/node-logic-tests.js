/**
 * 역할:
 * - 브라우저 없이도 mini React 런타임과 핵심 diff 로직이 유지되는지 확인하는 Node 테스트입니다.
 */

import { FunctionComponent, renderChild } from "../src/core/component.js";
import { diffTrees } from "../src/core/diff.js";
import { useEffect, useMemo, useState } from "../src/core/hooks.js";
import { flushScheduledUpdates } from "../src/core/scheduler.js";
import { h } from "../src/core/vdom.js";

const tests = [
  {
    name: "useState preserves state between renders",
    async run() {
      const renderValues = [];
      const api = {};

      function Counter() {
        const [count, setCount] = useState(0);
        api.setCount = setCount;
        renderValues.push(count);
        return h("div", {}, String(count));
      }

      const component = new FunctionComponent(Counter);
      component.mount();
      api.setCount(2);
      await flushScheduledUpdates();

      assert(renderValues.join(",") === "0,2", "state should survive across renders");
    },
  },
  {
    name: "batched setState schedules only one extra update",
    async run() {
      const api = {};

      function Counter() {
        const [count, setCount] = useState(0);
        api.setCount = setCount;
        return h("div", {}, String(count));
      }

      const component = new FunctionComponent(Counter);
      component.mount();

      api.setCount((previous) => previous + 1);
      api.setCount((previous) => previous + 1);
      await flushScheduledUpdates();

      assert(component.renderCount === 2, "two setState calls should batch into one update");
      assert(component.getStateSnapshot() === 2, "final state should reflect both updates");
    },
  },
  {
    name: "useEffect compares deps and runs cleanup on change",
    async run() {
      const steps = [];
      const api = {};

      function EffectDemo() {
        const [count, setCount] = useState(0);
        api.setCount = setCount;

        useEffect(() => {
          steps.push(`effect:${count}`);
          return () => {
            steps.push(`cleanup:${count}`);
          };
        }, [count]);

        return h("div", {}, String(count));
      }

      const component = new FunctionComponent(EffectDemo);
      component.mount();
      api.setCount(1);
      await flushScheduledUpdates();
      api.setCount(1);
      await flushScheduledUpdates();

      assert(
        steps.join(",") === "effect:0,cleanup:0,effect:1",
        "effect should rerun only when deps change",
      );

      component.destroy();
    },
  },
  {
    name: "useMemo returns cached value when deps do not change",
    async run() {
      let computeCount = 0;
      const api = {};

      function MemoDemo() {
        const [state, setState] = useState({ count: 1, draft: "" });
        api.setState = setState;

        const doubled = useMemo(() => {
          computeCount += 1;
          return state.count * 2;
        }, [state.count]);

        return h("div", {}, String(doubled));
      }

      const component = new FunctionComponent(MemoDemo);
      component.mount();

      api.setState((previous) => ({ ...previous, draft: "only-input-change" }));
      await flushScheduledUpdates();

      const memoHook = component.getHookDebugInfo().find((hook) => hook.kind === "memo");

      assert(computeCount === 1, "memo factory should not rerun when deps are unchanged");
      assert(memoHook.cacheHits === 1, "memo hook should record cache reuse");

      api.setState((previous) => ({ ...previous, count: 2 }));
      await flushScheduledUpdates();

      assert(computeCount === 2, "memo factory should rerun when deps change");
    },
  },
  {
    name: "hooks are blocked inside child components",
    async run() {
      function Child() {
        useState(0);
        return h("span", {}, "bad");
      }

      function Root() {
        return h("div", {}, renderChild(Child));
      }

      const component = new FunctionComponent(Root);

      let error = null;

      try {
        component.mount();
      } catch (caught) {
        error = caught;
      }

      assert(error instanceof Error, "child component hook usage should throw");
      assert(
        error.message.includes("root component"),
        "error message should explain root-only hook restriction",
      );
    },
  },
  {
    name: "diff detects keyed insert and text update",
    async run() {
      const previous = {
        type: "fragment",
        children: [
          {
            type: "element",
            tagName: "li",
            attrs: { "data-key": "1" },
            children: [{ type: "text", value: "A" }],
          },
        ],
      };
      const next = {
        type: "fragment",
        children: [
          {
            type: "element",
            tagName: "li",
            attrs: { "data-key": "2" },
            children: [{ type: "text", value: "B" }],
          },
          {
            type: "element",
            tagName: "li",
            attrs: { "data-key": "1" },
            children: [{ type: "text", value: "A*" }],
          },
        ],
      };

      const changes = diffTrees(previous, next);
      const hasCreate = changes.some((change) => change.type === "CREATE_NODE");
      const hasTextUpdate = changes.some((change) => change.type === "UPDATE_TEXT");
      const hasMove = changes.some((change) => change.type === "MOVE_CHILD");

      assert(hasCreate, "keyed insert should be detected");
      assert(hasTextUpdate, "text update should be detected");
      assert(hasMove, "existing keyed node should be moved");
    },
  },
];

const failures = [];

for (const test of tests) {
  try {
    await test.run();
    console.log(`[PASS] ${test.name}`);
  } catch (error) {
    failures.push({ name: test.name, message: error.message });
    console.error(`[FAIL] ${test.name} - ${error.message}`);
  }
}

if (failures.length > 0) {
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
