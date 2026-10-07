function normalizeMongoUri(uri) {
  const canonicalHosts = process.env.MONGO_CANONICAL_HOSTS;
  if (!canonicalHosts || !uri.startsWith('mongodb+srv://')) return uri;

  const replicaSet = process.env.MONGO_REPLICA_SET;
  if (!replicaSet) {
    throw new Error('Thiếu MONGO_REPLICA_SET khi dùng MONGO_CANONICAL_HOSTS');
  }

  const match = uri.match(/^mongodb\+srv:\/\/([^@]+@)?[^/]+\/([^?]*)(?:\?(.*))?$/);
  if (!match) throw new Error('MongoDB SRV URI không hợp lệ');

  const credentials = match[1] || '';
  const database = match[2];
  const params = new URLSearchParams(match[3] || '');
  const hosts = canonicalHosts.split(',').map((host) => host.trim()).filter(Boolean);

  if (!hosts.length || hosts.some((host) => !/^[a-z0-9.-]+:\d+$/i.test(host))) {
    throw new Error('MONGO_CANONICAL_HOSTS không hợp lệ');
  }

  params.set('tls', 'true');
  params.set('replicaSet', replicaSet);
  if (!params.has('authSource')) params.set('authSource', 'admin');

  return `mongodb://${credentials}${hosts.join(',')}/${database}?${params}`;
}

module.exports = { normalizeMongoUri };
