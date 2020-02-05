// @ts-check

const verbose = require("./_verbose");

/**
 * @type {Map<string, { value: any; ttl: number; timer: NodeJS.Timeout; }>}
 */
const cache = new Map();

function add(name, value, ttl) {
  if(has(name)) {
    verbose(`add(...) at _cache.js: has("${name}") is true. Calling upd(...) ...`);
    return upd(name, value, ttl);
  }

  const id = setTimeout(() => {
    del(name);
  }, ttl);

  cache.set(name, { value: value, ttl: ttl, timer: id });
  verbose(`add(...) at _cache.js: "${name}" was successfully added to cache.`);
}

function del(name) {
  if(!has(name)) {
    verbose(`del(...) at _cache.js: "${name}" was already deleted.`);
    return;
  }

  const data = cache.get(name);

  clearTimeout(data.timer);
  cache.delete(name);

  verbose(`del(...) at _cache.js: "${name}" was successfully deleted from cache.`);
}

function get(name) {
  if(!has(name)) {
    verbose(`get(...) at _cache.js: "${name}" doesn't exist.`);
    return;
  }

  const data = cache.get(name);
  return data.value;
}

function has(name) {
  return cache.has(name);
}

function upd(name, value, ttl) {
  if(!has(name)) {
    verbose(`upd(...) at _cache.js: has("${name}") is false. Calling add(...) ...`);
    return add(name, value, ttl);
  }

  const data = cache.get(name);
  clearTimeout(data.timer);

  const id = setTimeout(() => {
    del(name);
  }, ttl);

  cache.set(name, { value: value, ttl: ttl, timer: id });
  verbose(`upd(...) at _cache.js: "${name}" was successfully updated.`);
}

module.exports = { add, del, get, has, upd };
