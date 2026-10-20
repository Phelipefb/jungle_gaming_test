import bcrypt from "bcryptjs";

const saltRounds = 10;

export async function hashPassword(password: string) {
  if (bcrypt.truncates(password)) {
    throw new Error("A senha ultrapassa o limite suportado.");
  }

  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (bcrypt.truncates(password)) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
