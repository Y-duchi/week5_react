import { strict as assert } from "node:assert";
import test from "node:test";
import { createHistory, pushHistory, undoHistory, redoHistory, getCurrentVNode } from "../../src/core/history.js";
import { createVNode } from "../../src/core/types.js";

test("history push/undo/redo works", () => {
  const history0 = createHistory(createVNode("div", { id: "start" }, []));
  const history1 = pushHistory(history0, createVNode("div", { id: "next" }, []));
  const history2 = undoHistory(history1);
  const currentAfterUndo = getCurrentVNode(history2);
  assert.equal(currentAfterUndo?.props.id, "start");

  const history3 = redoHistory(history2);
  const currentAfterRedo = getCurrentVNode(history3);
  assert.equal(currentAfterRedo?.props.id, "next");
});
