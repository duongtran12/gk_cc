const dns = require('node:dns');
const net = require('node:net');

function configureDns() {
  const configuredServers = process.env.MONGO_DNS_SERVERS;
  if (!configuredServers) return;

  const servers = configuredServers
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (!servers.length || servers.some((server) => net.isIP(server) === 0)) {
    throw new Error('MONGO_DNS_SERVERS phải là danh sách địa chỉ IP, phân cách bằng dấu phẩy');
  }

  dns.setServers(servers);
}

module.exports = { configureDns };
