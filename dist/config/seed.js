"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const user_1 = __importDefault(require("../schema/user"));
const users = [
  {
    id: "1",
    name: "ketua",
    nip: "000000000000000000",
    email: "ketua@mail.com",
    password: "$2b$10$sRL4PxTRB4n8UnGT5T.EjOexHIurt9BAF1yXDCKd4AG3M3mjNm0/W",
    team: "TU",
    position: "KETUA",
  },
  {
    id: "2",
    name: "anggota",
    nip: "111111111111111111",
    email: "anggota@mail.com",
    password: "$2b$10$sRL4PxTRB4n8UnGT5T.EjOexHIurt9BAF1yXDCKd4AG3M3mjNm0/W",
    team: "TU",
    position: "ANGGOTA",
  },
];
async function seedDB() {
  try {
    const db = await (0, db_1.default)();
    await user_1.default.create(users);
    db.connection.close();
    console.log("Successfully seeding database");
  } catch (err) {
    let message;
    if (typeof err === "string") {
      message = err.toUpperCase();
    } else if (err instanceof Error) {
      message = err.message;
    }
    console.error("Error:", message);
  } finally {
    process.exit(1);
  }
}
seedDB();
