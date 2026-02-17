import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import * as bcrypt from "bcryptjs";
import { User } from "./types";

const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

function loadUsers(): User[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
}

function saveUsers(users: User[]): void {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function register(rl: readline.Interface): Promise<boolean> {
  const username = (await ask(rl, "Choose a username: ")).trim();
  if (!username) {
    console.log("Username cannot be empty.");
    return false;
  }

  const users = loadUsers();
  if (users.find((u) => u.username === username)) {
    console.log("Username already taken.");
    return false;
  }

  const password = (await ask(rl, "Choose a password: ")).trim();
  if (!password) {
    console.log("Password cannot be empty.");
    return false;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ username, passwordHash });
  saveUsers(users);
  console.log(`\nRegistered successfully! Welcome, ${username}.`);
  return true;
}

async function login(rl: readline.Interface): Promise<boolean> {
  const username = (await ask(rl, "Username: ")).trim();
  const password = (await ask(rl, "Password: ")).trim();

  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user) {
    console.log("User not found.");
    return false;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    console.log("Incorrect password.");
    return false;
  }

  console.log(`\nWelcome back, ${username}!`);
  return true;
}

export async function promptAuth(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      console.log("\n1. Register");
      console.log("2. Login");
      const choice = (await ask(rl, "\nChoose an option (1 or 2): ")).trim();

      if (choice === "1") {
        if (await register(rl)) return;
      } else if (choice === "2") {
        if (await login(rl)) return;
      } else {
        console.log("Invalid option. Please enter 1 or 2.");
      }
    }
  } finally {
    rl.close();
  }
}
