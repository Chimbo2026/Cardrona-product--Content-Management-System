// Browser-only demo database. No hosted backend, credentials, or network calls.
const PREFIX = 'cardrona_local_v1:';
const listeners = new Map();
const clone = value => structuredClone(value);
const read = name => JSON.parse(localStorage.getItem(PREFIX + name) || '[]');
function write(name, rows, event) {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows));
  for (const callback of listeners.get(name) || []) callback(clone(event));
  return clone(event.data);
}
function matches(row, query) {
  return Object.entries(query).every(([key, expected]) => {
    if (key === '$or') return expected.some(q => matches(row, q));
    if (key === '$and') return expected.every(q => matches(row, q));
    const actual = row[key];
    if (!expected || typeof expected !== 'object' || Array.isArray(expected)) return actual === expected;
    return Object.entries(expected).every(([op, value]) => {
      switch (op) {
        case '$eq': return actual === value;
        case '$ne': return actual !== value;
        case '$in': return value.includes(actual);
        case '$nin': return !value.includes(actual);
        case '$gt': return actual > value;
        case '$gte': return actual >= value;
        case '$lt': return actual < value;
        case '$lte': return actual <= value;
        case '$exists': return (actual !== undefined && actual !== null) === value;
        case '$regex': return new RegExp(value, expected.$options || '').test(String(actual ?? ''));
        case '$options': return true;
        default: throw new Error(`Unsupported local filter: ${op}`);
      }
    });
  });
}
function collection(name) {
  const api = {
    async filter(query = {}, options = {}, limit) {
      if (typeof options === 'string') options = { sort: options, limit };
      let rows = read(name).filter(row => matches(row, query));
      if (options.sort) {
        const descending = options.sort.startsWith('-');
        const field = options.sort.replace(/^[-+]/, '');
        rows.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (descending ? -1 : 1));
      }
      return clone(rows.slice(options.skip || 0, options.limit == null ? undefined : (options.skip || 0) + options.limit));
    },
    async list(sort, limit) { return api.filter({}, sort || {}, limit); },
    async get(id) {
      const row = read(name).find(row => row.id === id);
      if (!row) throw new Error(`${name} record not found`);
      return clone(row);
    },
    async create(data) {
      const now = new Date().toISOString();
      const row = { ...data, id: crypto.randomUUID(), created_date: now, updated_date: now };
      return write(name, [...read(name), row], { type: 'create', id: row.id, data: row });
    },
    async update(id, patch) {
      const rows = read(name);
      const index = rows.findIndex(row => row.id === id);
      if (index < 0) throw new Error(`${name} record not found`);
      rows[index] = { ...rows[index], ...patch, id, updated_date: new Date().toISOString() };
      return write(name, rows, { type: 'update', id, data: rows[index] });
    },
    async delete(id) {
      const row = await api.get(id);
      write(name, read(name).filter(item => item.id !== id), { type: 'delete', id, data: row });
      return row;
    },
    async bulkUpdate(rows) { return Promise.all(rows.map(({ id, ...patch }) => api.update(id, patch))); },
    async updateMany(query, patch) { return Promise.all((await api.filter(query)).map(row => api.update(row.id, patch))); },
    subscribe(callback) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(callback);
      const onStorage = event => { if (event.key === PREFIX + name) callback({ type: 'refresh' }); };
      window.addEventListener('storage', onStorage);
      return () => { listeners.get(name).delete(callback); window.removeEventListener('storage', onStorage); };
    },
  };
  return api;
}
const unavailable = () => { throw new Error('Unavailable in local mode. Connect an independent service to enable real payments, email or social sign-in.'); };
const user = { id: 'local-admin', full_name: 'Local Administrator', email: 'admin@localhost', role: 'admin' };
async function upload({ file }) {
  const url = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
  return { file_url: url, file_uri: url };
}
/** @type {Record<string, ReturnType<typeof collection>>} */
const entities = new Proxy({}, { get: (target, name) => target[name] ||= collection(name) });
export const localClient = {
  entities,
  app: { getPublicSettings: async () => ({ id: 'local', public_settings: {} }) },
  auth: {
    me: async () => clone(user), isAuthenticated: async () => true,
    logout: () => window.location.assign('/'), redirectToLogin: () => window.location.assign('/dashboard'),
    loginViaEmailPassword: unavailable, loginWithProvider: unavailable, register: unavailable,
    verifyOtp: unavailable, resendOtp: unavailable, resetPasswordRequest: unavailable, resetPassword: unavailable,
    setToken: () => {},
  },
  functions: { invoke: async () => unavailable() },
  integrations: { Core: {
    UploadPublicFile: upload, UploadPrivateFile: upload,
    CreateFileSignedUrl: async ({ file_uri }) => ({ signed_url: file_uri }),
  } },
};
