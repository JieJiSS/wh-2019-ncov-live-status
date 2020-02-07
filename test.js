const assert = require("assert");
const cache = require("./controller/_cache");
const obj2table = require("./controller/_obj2table");

assert.ok(
  Number(process.versions.node.split(".")[0]) >= 8,
  "Node.js major version should be no lower than 8.0.0"
);


cache.add("test", { a: 1 }, 100);
assert.ok(cache.has("test"), 'key "test" should be added to cache');
assert.deepStrictEqual(cache.get("test"), { a: 1 }, 'cached value of key "test" shouldn\'t change');
setTimeout(() => assert.ok(!cache.has("test"), 'key "test" should be removed from cache'), 115);
assert.ok(!cache.has("whatever"), "cache shouldn't contain uncached key");
assert.ok(!cache.has("__proto__"), "cache shouldn't contain uncached key");

assert.strictEqual(
  "\n" + obj2table({ a: 1 }), `
┌─────────┬─────────┐
│ (index) │ Values  │
├─────────┼─────────┤
│ a       │ 1       │
└─────────┴─────────┘`
);

assert.strictEqual(
  "\n" + obj2table({ CJK宽字符测试: 1, aaaabbbb: 2 }), `
┌───────────────┬─────────┐
│ (index)       │ Values  │
├───────────────┼─────────┤
│ CJK宽字符测试 │ 1       │
│ aaaabbbb      │ 2       │
└───────────────┴─────────┘`
);

assert.doesNotThrow(() => obj2table(null) && obj2table(void 0), "obj2table shouldn't throw");

console.log("all tests passed successfully.");
