import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import { adminMobileNumber, normalizeMobile } from "@/lib/auth";

const scrypt = promisify(scryptCallback);
const dbPath = path.join(process.cwd(), "data", "auth-db.json");
const sessionTtlMs = 1000 * 60 * 60 * 24 * 7;
const defaultAdminPassword = process.env.SLNS_ADMIN_PASSWORD ?? "admin123";

export interface StoredUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: "admin" | "customer";
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

interface StoredSession {
  id: string;
  userId: string;
  expiresAt: string;
}

interface AuthDatabase {
  users: StoredUser[];
  sessions: StoredSession[];
}

export interface PublicUser {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: "admin" | "customer";
}

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return {
    hash: derivedKey.toString("hex"),
    salt
  };
}

async function verifyPassword(password: string, user: StoredUser) {
  const { hash } = await hashPassword(password, user.passwordSalt);
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

function publicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    email: user.email,
    role: user.role
  };
}

async function createAdminUser(): Promise<StoredUser> {
  const password = await hashPassword(defaultAdminPassword);

  return {
    id: "user-admin",
    name: "SLNS Admin",
    mobile: adminMobileNumber,
    email: "admin@slns.demo",
    role: "admin",
    passwordHash: password.hash,
    passwordSalt: password.salt,
    createdAt: new Date().toISOString()
  };
}

async function readDatabase(): Promise<AuthDatabase> {
  try {
    const raw = await readFile(dbPath, "utf-8");
    const parsed = JSON.parse(raw) as AuthDatabase;
    const hasAdmin = parsed.users.some((user) => user.role === "admin" && user.mobile === adminMobileNumber);
    if (hasAdmin) return parsed;

    const databaseWithAdmin = { ...parsed, users: [await createAdminUser(), ...parsed.users] };
    await writeDatabase(databaseWithAdmin);
    return databaseWithAdmin;
  } catch {
    const initialDatabase = {
      users: [await createAdminUser()],
      sessions: []
    };
    await writeDatabase(initialDatabase);
    return initialDatabase;
  }
}

async function writeDatabase(database: AuthDatabase) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(database, null, 2));
}

function findUserByIdentifier(users: StoredUser[], identifier: string) {
  const normalizedIdentifier = normalizeMobile(identifier);
  const lowerIdentifier = identifier.trim().toLowerCase();

  return users.find(
    (user) =>
      (normalizedIdentifier && normalizeMobile(user.mobile) === normalizedIdentifier) ||
      user.email.toLowerCase() === lowerIdentifier
  );
}

export async function registerCustomer(identifier: string, password: string) {
  const normalizedMobile = normalizeMobile(identifier);
  const email = identifier.includes("@") ? identifier.trim().toLowerCase() : "";
  const database = await readDatabase();

  if (!identifier.trim() || !password) {
    throw new Error("Phone/email and password are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  if (normalizedMobile === adminMobileNumber || email === "admin@slns.demo") {
    throw new Error("Admin account already exists. Please log in.");
  }

  if (findUserByIdentifier(database.users, identifier)) {
    throw new Error("An account with this phone/email already exists.");
  }

  const hashedPassword = await hashPassword(password);
  const user: StoredUser = {
    id: `user-${Date.now()}`,
    name: "SLNS Customer",
    mobile: normalizedMobile || identifier.trim(),
    email: email || "customer@slns.demo",
    role: "customer",
    passwordHash: hashedPassword.hash,
    passwordSalt: hashedPassword.salt,
    createdAt: new Date().toISOString()
  };

  database.users.push(user);
  await writeDatabase(database);
  return createSessionForUser(user);
}

export async function loginUser(identifier: string, password: string) {
  const database = await readDatabase();
  const user = findUserByIdentifier(database.users, identifier);

  if (!user || !(await verifyPassword(password, user))) {
    throw new Error("Invalid phone/email or password.");
  }

  return createSessionForUser(user);
}

export async function createSessionForUser(user: StoredUser) {
  const database = await readDatabase();
  const session: StoredSession = {
    id: randomBytes(32).toString("hex"),
    userId: user.id,
    expiresAt: new Date(Date.now() + sessionTtlMs).toISOString()
  };

  database.sessions = database.sessions
    .filter((item) => new Date(item.expiresAt).getTime() > Date.now())
    .concat(session);
  await writeDatabase(database);

  return {
    sessionId: session.id,
    user: publicUser(user)
  };
}

export async function getUserBySession(sessionId?: string) {
  if (!sessionId) return null;

  const database = await readDatabase();
  const session = database.sessions.find((item) => item.id === sessionId);

  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  const user = database.users.find((item) => item.id === session.userId);
  return user ? publicUser(user) : null;
}

export async function deleteSession(sessionId?: string) {
  if (!sessionId) return;

  const database = await readDatabase();
  database.sessions = database.sessions.filter((session) => session.id !== sessionId);
  await writeDatabase(database);
}
