// servidor-teste.js: enderecosRede só devolve IPv4 não internos (interfaces falsas).
const test = require('node:test');
const assert = require('node:assert');
const { enderecosRede } = require('../servidor-teste');

test('só IPv4 fora do loopback', () => {
  const falsas = {
    lo: [{ address: '127.0.0.1', family: 'IPv4', internal: true }, { address: '::1', family: 'IPv6', internal: true }],
    wlan0: [{ address: '192.168.0.12', family: 'IPv4', internal: false }, { address: 'fe80::1', family: 'IPv6', internal: false }],
    eth0: [{ address: '10.0.0.5', family: 4, internal: false }],
    docker0: [],
  };
  assert.deepStrictEqual(enderecosRede(falsas), ['192.168.0.12', '10.0.0.5']);
  assert.deepStrictEqual(enderecosRede({}), []);
});
