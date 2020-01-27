// @ts-check

/**
 * @type {Map<string, { value: any; ttl: number; timer: NodeJS.Timeout; }>}
 */
const cache = new Map();

function add(name, value, ttl) {
  if(has(name)) {
    return upd(name, value, ttl);
  }

  const id = setTimeout(() => {
    del(name);
  }, ttl);

  cache.set(name, { value: value, ttl: ttl, timer: id });
}

function del(name) {
  if(!has(name)) {
    return;
  }

  const data = cache.get(name);

  clearTimeout(data.timer);
  cache.delete(name);
}

function get(name) {
  if(!has(name)) {
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
    return add(name, value, ttl);
  }

  const data = cache.get(name);
  clearTimeout(data.timer);

  const id = setTimeout(() => {
    del(name);
  }, ttl);

  cache.set(name, { value: value, ttl: ttl, timer: id });
}

module.exports = { add, del, get, has, upd };
