import { diffTrees } from "../src/core/diff.js";
import { serializeVdom } from "../src/core/vdom.js";
import { FunctionComponent } from "../src/runtime/component.js";
import { h } from "../src/runtime/h.js";
import { useEffect, useMemo, useState } from "../src/runtime/hooks.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const tests = [
  {
    name: "diff detects text and attribute changes",
    run() {
      const previous = {
        type: "fragment",
        children: [
          {
            type: "element",
            tagName: "p",
            attrs: { class: "old" },
            children: [{ type: "text", value: "hello" }],
          },
        ],
      };
      const next = {
        type: "fragment",
        children: [
          {
            type: "element",
            tagName: "p",
            attrs: { class: "new", title: "greeting" },
            children: [{ type: "text", value: "hello world" }],
          },
        ],
      };

      const changes = diffTrees(previous, next);
      assert(changes.length === 3, "텍스트와 속성 변경 3개를 감지해야 합니다.");
    },
  },
  {
    name: "h renders pure function children",
    run() {
      function Badge({ label }) {
        return h("strong", {}, label);
      }

      const tree = h("div", { className: "wrapper" }, h(Badge, { label: "Hooks" }));
      const html = serializeVdom(tree);

      assert(html.includes('<div class="wrapper">'), "wrapper div가 있어야 합니다.");
      assert(html.includes("<strong>Hooks</strong>"), "자식 함수형 컴포넌트 결과가 렌더되어야 합니다.");
    },
  },
  {
    name: "useState preserves values across rerenders",
    run() {
      const snapshots = [];
      let setCount = null;

      function Counter() {
        const [count, updateCount] = useState(0);
        setCount = updateCount;
        return h("div", { className: "counter" }, `count:${count}`);
      }

      const component = new FunctionComponent(Counter, {}, {
        mountRenderer(_container, tree) {
          snapshots.push(serializeVdom(tree));
        },
        patchRenderer(_container, _previous, next) {
          snapshots.push(serializeVdom(next));
          return { mutationCount: 1 };
        },
        scheduler(task) {
          task();
        },
      });

      component.mount({});
      setCount((value) => value + 2);

      assert(snapshots[0].includes("count:0"), "초기 카운트가 0이어야 합니다.");
      assert(snapshots[1].includes("count:2"), "상태 변경 후 카운트가 2여야 합니다.");
    },
  },
  {
    name: "useMemo caches derived values until deps change",
    run() {
      let setCount = null;
      let setTheme = null;
      let deriveCalls = 0;

      function MemoView() {
        const [count, updateCount] = useState(1);
        const [theme, updateTheme] = useState("citrus");
        const doubled = useMemo(() => {
          deriveCalls += 1;
          return count * 2;
        }, [count]);

        setCount = updateCount;
        setTheme = updateTheme;

        return h("div", {}, `${theme}:${doubled}`);
      }

      const component = new FunctionComponent(MemoView, {}, {
        mountRenderer() {},
        patchRenderer() {
          return { mutationCount: 1 };
        },
        scheduler(task) {
          task();
        },
      });

      component.mount({});
      setTheme("forest");
      setCount(2);

      assert(deriveCalls === 2, "count가 바뀔 때만 useMemo가 다시 계산되어야 합니다.");
    },
  },
  {
    name: "useEffect runs cleanup before next effect",
    run() {
      const log = [];
      let setPhase = null;

      function EffectView() {
        const [phase, updatePhase] = useState("mount");
        setPhase = updatePhase;

        useEffect(() => {
          log.push(`effect:${phase}`);
          return () => {
            log.push(`cleanup:${phase}`);
          };
        }, [phase]);

        return h("p", {}, phase);
      }

      const component = new FunctionComponent(EffectView, {}, {
        mountRenderer() {},
        patchRenderer() {
          return { mutationCount: 1 };
        },
        scheduler(task) {
          task();
        },
      });

      component.mount({});
      setPhase("update");

      assert(
        log.join(",") === "effect:mount,cleanup:mount,effect:update",
        "effect cleanup 순서가 올바르지 않습니다.",
      );
    },
  },
  {
    name: "scheduleUpdate batches multiple state updates in one tick",
    run() {
      const queue = [];
      let renderCount = 0;
      let setCount = null;

      function BatchedView() {
        const [count, updateCount] = useState(0);
        renderCount += 1;
        setCount = updateCount;
        return h("p", {}, count);
      }

      const component = new FunctionComponent(BatchedView, {}, {
        mountRenderer() {},
        patchRenderer() {
          return { mutationCount: 1 };
        },
        scheduler(task) {
          queue.push(task);
        },
      });

      component.mount({});
      setCount((value) => value + 1);
      setCount((value) => value + 1);

      assert(queue.length === 1, "같은 tick 안에서는 update가 한 번만 예약되어야 합니다.");

      queue[0]();

      assert(renderCount === 2, "초기 렌더와 batched update 총 두 번 렌더되어야 합니다.");
    },
  },
];

let failures = 0;

tests.forEach((test) => {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${test.name}`);
    console.error(error.message);
  }
});

if (failures > 0) {
  process.exit(1);
}

console.log(`\n${tests.length} tests passed.`);
