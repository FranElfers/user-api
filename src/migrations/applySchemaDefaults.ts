import mongoose, { SchemaType } from "mongoose";
import { User } from "../models/user";

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);

  const schemaPaths: Record<string, SchemaType> = User.schema.paths;
  console.log(`SchemaPaths: ${schemaPaths}`);

  const usuarios = await User.find({}).lean();

  for (const user of usuarios as Record<string, any>[]) {
    const updates: Record<string, any> = {};
    for (const [field, schemaType] of Object.entries(schemaPaths)) {
      if (["_id", "__v"].includes(field)) continue;
      const value = user[field];

      // If User don't have the new field and has a default option. Add the new field
      if (!(field in user) && schemaType.options?.default) {
        updates[field] = schemaType.options.default;
      }

      try {
        const casted = schemaType.cast(value);

        if (casted !== value) {
          updates[field] = casted;
        }
      } catch (error) {
        return new Error(`Error to change value type '${value}' on field: ${field}`)
      }
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: user._id }, { $set: updates });
    }
  }

  console.log("Migrate completed");
  await mongoose.disconnect();
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
