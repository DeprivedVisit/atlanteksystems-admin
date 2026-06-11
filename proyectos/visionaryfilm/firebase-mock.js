// Demo mode — almacenamiento en localStorage
// Reemplazar firebase-config.js con Firebase real cuando esté listo

const DEMO_EMAIL = 'admin@visionaryfilm.cr';
const DEMO_PASS  = 'vf2024';
const P = 'vfdb_';

let _authUser = null;
let _authCbs  = [];
let _listeners = {};

// ===== STORAGE =====
function _getCol(name)      { try { return JSON.parse(localStorage.getItem(P+'col_'+name))||[]; } catch { return []; } }
function _setCol(name, docs){ localStorage.setItem(P+'col_'+name, JSON.stringify(docs)); _fire('col_'+name); }
function _getSpecial(path)  { try { return JSON.parse(localStorage.getItem(P+'doc_'+path)); }    catch { return null; } }
function _setSpecial(path,d){ localStorage.setItem(P+'doc_'+path, JSON.stringify(d)); _fire('doc_'+path); }

function _fire(key) { (_listeners[key]||[]).forEach(cb => cb()); }
function _id()      { return Math.random().toString(36).slice(2)+Date.now().toString(36); }

// ===== REFS & QUERY =====
class ColRef { constructor(n){ this.name=n; } }
class DocRef { constructor(col,id,path,special){ this.colName=col; this.id=id; this._path=path; this._isSpecial=!!special; } }
class Query  { constructor(ref,...c){ this.ref=ref; this.constraints=c; } }
class OBy    { constructor(f,d){ this.f=f; this.d=d||'asc'; } }
class Whr    { constructor(f,op,v){ this.f=f; this.op=op; this.v=v; } }
class Lim    { constructor(n){ this.n=n; } }

export const db   = {};
export const auth = {};

export function collection(_db, name)      { return new ColRef(name); }
export function query(ref, ...constraints) { return new Query(ref, ...constraints); }
export function orderBy(f, d)              { return new OBy(f, d); }
export function where(f, op, v)            { return new Whr(f, op, v); }
export function limit(n)                   { return new Lim(n); }

export function doc(_dbOrCol, nameOrId, id) {
  if (id !== undefined) return new DocRef(nameOrId, id, nameOrId+'/'+id, true);
  if (_dbOrCol instanceof ColRef) return new DocRef(_dbOrCol.name, nameOrId, _dbOrCol.name+'/'+nameOrId, false);
  return new DocRef(nameOrId, id, nameOrId, true);
}

// ===== SERIALIZATION =====
function _ser(data) {
  const o = {};
  for (const [k,v] of Object.entries(data)) {
    if (v === undefined) continue;
    o[k] = v instanceof Date ? {_d: v.toISOString()} : v;
  }
  return o;
}
function _des(data) {
  if (!data) return data;
  const o = {};
  for (const [k,v] of Object.entries(data)) {
    o[k] = (v && typeof v==='object' && v._d)
      ? { toDate: ()=>new Date(v._d), toMillis: ()=>new Date(v._d).getTime() }
      : v;
  }
  return o;
}

// ===== QUERY EXECUTION =====
function _exec(qOrRef) {
  const ref = qOrRef instanceof Query ? qOrRef.ref : qOrRef;
  const cs  = qOrRef instanceof Query ? qOrRef.constraints : [];
  let docs  = _getCol(ref.name);
  for (const c of cs) {
    if (c instanceof Whr) {
      docs = docs.filter(d => {
        const v = d[c.f];
        if (c.op==='==') return v===c.v;
        if (c.op==='!=') return v!==c.v;
        if (c.op==='>') return v>c.v;
        if (c.op==='<') return v<c.v;
        return true;
      });
    }
    if (c instanceof OBy) {
      docs = docs.slice().sort((a,b) => {
        const av=a[c.f], bv=b[c.f];
        const cmp = av<bv?-1:(av>bv?1:0);
        return c.d==='desc'?-cmp:cmp;
      });
    }
    if (c instanceof Lim) docs = docs.slice(0, c.n);
  }
  return docs;
}

function _snap(docs) {
  return { docs: docs.map(d=>({ id:d.id, data:()=>_des({...d}), exists:()=>true })) };
}

// ===== CRUD =====
export async function addDoc(colRef, data) {
  const docs = _getCol(colRef.name);
  const id   = _id();
  docs.push({ id, ..._ser(data) });
  _setCol(colRef.name, docs);
  return { id };
}

export async function setDoc(ref, data, opts) {
  if (ref._isSpecial) {
    const ex = _getSpecial(ref._path)||{};
    _setSpecial(ref._path, opts?.merge ? {...ex,..._ser(data)} : _ser(data));
  } else {
    const docs = _getCol(ref.colName);
    const idx  = docs.findIndex(d=>d.id===ref.id);
    const s    = _ser(data);
    if (idx>=0) docs[idx] = opts?.merge ? {...docs[idx],...s} : {id:ref.id,...s};
    else        docs.push({id:ref.id,...s});
    _setCol(ref.colName, docs);
  }
}

export async function getDoc(ref) {
  if (ref._isSpecial) {
    const d = _getSpecial(ref._path);
    return { exists:()=>d!==null, data:()=>d?_des(d):null, id:ref.id };
  }
  const found = _getCol(ref.colName).find(d=>d.id===ref.id);
  return { exists:()=>!!found, data:()=>found?_des({...found}):null, id:ref.id };
}

export async function getDocs(qOrRef) {
  const docs = _exec(qOrRef);
  const s    = _snap(docs);
  s.forEach   = cb => docs.forEach(d=>cb({id:d.id,data:()=>_des({...d})}));
  return s;
}

export async function updateDoc(ref, data) {
  const docs = _getCol(ref.colName);
  const idx  = docs.findIndex(d=>d.id===ref.id);
  if (idx>=0) { docs[idx]={...docs[idx],..._ser(data)}; _setCol(ref.colName, docs); }
}

export async function deleteDoc(ref) {
  _setCol(ref.colName, _getCol(ref.colName).filter(d=>d.id!==ref.id));
}

export function onSnapshot(qOrRef, callback) {
  let key;
  if (qOrRef instanceof Query)       key = 'col_'+qOrRef.ref.name;
  else if (qOrRef._isSpecial)        key = 'doc_'+qOrRef._path;
  else                               key = 'col_'+qOrRef.colName;

  const fire = () => {
    if (qOrRef._isSpecial) {
      const d = _getSpecial(qOrRef._path);
      callback({ exists:()=>d!==null, data:()=>d?_des(d):null });
    } else {
      callback(_snap(_exec(qOrRef)));
    }
  };
  if (!_listeners[key]) _listeners[key]=[];
  _listeners[key].push(fire);
  fire();
  return () => { _listeners[key]=(_listeners[key]||[]).filter(f=>f!==fire); };
}

// ===== AUTH =====
export async function signInWithEmailAndPassword(_auth, email, pass) {
  // Admin principal hardcodeado
  if (email.trim()===DEMO_EMAIL && pass===DEMO_PASS) {
    _authUser = { email, nombre:'Fabian', rol:'admin', uid:'admin_main' };
    localStorage.setItem('vf_auth', JSON.stringify(_authUser));
    _authCbs.forEach(cb=>cb(_authUser));
    return { user: _authUser };
  }
  // Empleados guardados en colección _users
  const users = _getCol('_users');
  const found = users.find(u => u.email===email.trim() && u.password===pass && u.activo!==false);
  if (found) {
    _authUser = { email:found.email, nombre:found.nombre, rol:found.rol||'employee', uid:found.id };
    localStorage.setItem('vf_auth', JSON.stringify(_authUser));
    _authCbs.forEach(cb=>cb(_authUser));
    return { user: _authUser };
  }
  const err = new Error('Correo o contraseña incorrectos.');
  err.code  = 'auth/wrong-password';
  throw err;
}

export async function signOut(_auth) {
  _authUser = null;
  localStorage.removeItem('vf_auth');
  _authCbs.forEach(cb=>cb(null));
}

export function onAuthStateChanged(_auth, callback) {
  _authCbs.push(callback);
  try { _authUser = JSON.parse(localStorage.getItem('vf_auth')); } catch { _authUser=null; }
  callback(_authUser);
  return () => { _authCbs=_authCbs.filter(c=>c!==callback); };
}
