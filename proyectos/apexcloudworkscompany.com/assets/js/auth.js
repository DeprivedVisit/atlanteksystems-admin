/* ── Apex Cloudworks Auth — AWS Cognito ──
   Rellena USER_POOL_ID y CLIENT_ID después de crear el User Pool en AWS Console.
   Región: us-east-1 (ajustar si usas otra)
*/
const AUTH_CONFIG = {
  UserPoolId: 'us-east-1_XXXXXXXXX',   // ← reemplazar
  ClientId:   'XXXXXXXXXXXXXXXXXXXXXXXXXX', // ← reemplazar
  Region:     'us-east-1',
};

const ADMIN_GROUP = 'admins';

/* ── Helpers ── */
function getUserPool() {
  return new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: AUTH_CONFIG.UserPoolId,
    ClientId:   AUTH_CONFIG.ClientId,
  });
}

function getCurrentUser() {
  return getUserPool().getCurrentUser();
}

/* Obtener sesión activa — retorna Promise<session | null> */
function getSession() {
  return new Promise((resolve) => {
    const user = getCurrentUser();
    if (!user) return resolve(null);
    user.getSession((err, session) => {
      if (err || !session.isValid()) return resolve(null);
      resolve(session);
    });
  });
}

/* Obtener grupos del usuario actual */
function getUserGroups(session) {
  try {
    const payload = session.getIdToken().decodePayload();
    return payload['cognito:groups'] || [];
  } catch { return []; }
}

/* Verificar si el usuario es admin */
async function isAdmin() {
  const session = await getSession();
  if (!session) return false;
  return getUserGroups(session).includes(ADMIN_GROUP);
}

/* Login — retorna Promise<{ok, error, needsNewPassword}> */
function login(email, password) {
  return new Promise((resolve) => {
    const authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
      Username: email,
      Pool: getUserPool(),
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: () => resolve({ ok: true }),
      onFailure: (err) => resolve({ ok: false, error: err.message }),
      newPasswordRequired: () => resolve({ ok: false, needsNewPassword: true, user: cognitoUser }),
    });
  });
}

/* Logout */
function logout() {
  const user = getCurrentUser();
  if (user) user.signOut();
  window.location.href = 'login.html';
}

/* Redirigir si no autenticado */
async function requireAuth(adminOnly = false) {
  const session = await getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  if (adminOnly && !getUserGroups(session).includes(ADMIN_GROUP)) {
    window.location.href = 'dashboard.html';
    return null;
  }
  return session;
}

/* Obtener nombre / email del usuario actual */
async function getUserInfo() {
  const session = await getSession();
  if (!session) return null;
  const payload = session.getIdToken().decodePayload();
  return {
    email: payload.email || payload['cognito:username'],
    name:  payload.name  || payload.email || 'Usuario',
    groups: getUserGroups(session),
    isAdmin: getUserGroups(session).includes(ADMIN_GROUP),
  };
}
