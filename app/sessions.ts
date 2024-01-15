import { createSessionStorage } from "@remix-run/node";
import { DatabaseClient } from "./db";

const createDatabaseSessionStorage = () => {
  const db = new DatabaseClient(process.env.MONGODB, "smoothly_cache");

  return createSessionStorage({
    cookie: {
      name: "__smoothly_session",
      secrets: [process.env.SECRET],
    },
    async createData(data, expires) {
      const id = await db.insert(data);
      return id;
    },
    async readData(id) {
      return (await db.select(id)) || null;
    }, 
    async updateData(id, data, expires) {
      await db.update(id, data);
    }, 
    async deleteData(id) {
      await db.delete(id);
    }
  });
}

const { getSession, commitSession, destroySession } = createDatabaseSessionStorage();
export { getSession, commitSession, destroySession };

