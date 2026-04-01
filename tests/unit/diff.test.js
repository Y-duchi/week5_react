import { strict as assert } from "node:assert";
import test from "node:test";
import { createTextVNode, createVNode } from "../../src/core/types.js";
import { diff } from "../../src/core/diff.js";

test("TEXT patch is created", () => {
  const left = createVNode("p", {}, [createTextVNode("hello")]);
  const right = createVNode("p", {}, [createTextVNode("world")]);
  const patches = diff(left, right);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].kind, "TEXT");
  assert.equal(patches[0].path.length, 1);
  assert.equal(patches[0].text, "world");
});

test("SET_PROP patch is created", () => {
  const left = createVNode("button", { className: "a" }, []);
  const right = createVNode("button", { className: "b" }, []);
  const patches = diff(left, right);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].kind, "SET_PROP");
  assert.equal(patches[0].key, "className");
  assert.equal(patches[0].value, "b");
});

test("REPLACE patch is created", () => {
  const left = createVNode("section", {}, []);
  const right = createVNode("article", {}, []);
  const patches = diff(left, right);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].kind, "REPLACE");
});
