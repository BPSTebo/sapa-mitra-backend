import connectDB from "../config/db.js";
import UserSchema from "../schema/user.js";
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
        const db = await connectDB();
        await UserSchema.create(users);
        db.connection.close();
        console.log("Successfully seeding database");
    }
    catch (err) {
        let message;
        if (typeof err === "string") {
            message = err.toUpperCase();
        }
        else if (err instanceof Error) {
            message = err.message;
        }
        console.error("Error:", message);
    }
    finally {
        process.exit(1);
    }
}
seedDB();
