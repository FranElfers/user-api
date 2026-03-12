import { User } from "../src/models/user";
import jwt from "jsonwebtoken";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function seed() {
  rl.question("This Script will DELETE all Users and CREATE an Admin User. Continue? (y/n): ", async (input) => {
    if (input.toLowerCase() !== "y") {
      console.log("Seed canceleted.");
      rl.close();
      process.exit(0);
    }

    try {
      const superAdmin = new User({
          name: "admin",
          cuit: "0",
          email: "admin@example.com",
          status: "activo",
          isAdmin: true,
          config: {},
        });
  
      // Clean User collection Limpia la colección antes de insertar
      await User.deleteMany({});
      console.log("User collection cleaned");

      // Inserta los nuevos datos
      await superAdmin.save();
      console.log("Admin user created");
      console.log(`TOKEN: ${jwt.sign({sub: superAdmin._id.toString()}, process.env.SECRET_API_KEY!)}`);
    } catch (error) {
      console.error("Interal Error:", error);
      process.exit(1);
    } finally {
      rl.close();
    }
  });
}

seed();
