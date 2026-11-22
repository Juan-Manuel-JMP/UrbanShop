import { CONFIG } from '../config.js';
import { storage, emit } from './storage.js';

/*
 * autenticacion de prueba, los usuarios se guardan en localStorage.
 */
const USERS_KEY = CONFIG.storageKeys.users;
const SESSION_KEY = CONFIG.storageKeys.session;

async function hashPassword(text) {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  } 
}

const cleanEmail = (email) => email.trim().toLowerCase();

export const getUser = () => storage.get(SESSION_KEY, null);
export const isLoggedIn = () => getUser() !== null;

function startSession(user) {
  storage.set(SESSION_KEY, { id: user.id, name: user.name, email: user.email });
  emit('auth:changed');
}

export async function register({ name, email, password }) {
  const users = storage.get(USERS_KEY, []);
  const mail = cleanEmail(email);

  if (users.some((user) => user.email === mail)) {
    return { ok: false, field: 'email', message: 'ese email ya esta registrado' };
  }

  const user = {
    id: `u-${Date.now().toString(36)}`,
    name: name.trim(),
    email: mail,
    password: await hashPassword(password)
  };
  users.push(user);
  storage.set(USERS_KEY, users);
  startSession(user);
  return { ok: true, user };
}

export async function login({ email, password }) {
  const users = storage.get(USERS_KEY, []);
  const user = users.find((entry) => entry.email === cleanEmail(email));
  const hashed = await hashPassword(password);

  if (!user || user.password !== hashed) {
    return { ok: false, message: 'email o contraseña incorrecta' };
  }
  startSession(user);
  return { ok: true, user };
}

export function logout() {
  storage.remove(SESSION_KEY);
  emit('auth:changed');
}

/** creo una cuenta de prueba para poder probar el login. */
export async function seedDemoUser() {
  const users = storage.get(USERS_KEY, []);
  const { name, email, password } = CONFIG.demoUser;
  if (users.some((user) => user.email === email)) return;

  users.push({ id: 'u-demo', name, email, password: await hashPassword(password) });
  storage.set(USERS_KEY, users);
}