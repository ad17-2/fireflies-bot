import { configureApp, PORT } from "./config/app.config.js";
import { connectDB } from "./config/database.config.js";

const startServer = async () => {
  try {
    await connectDB();

    const app = configureApp();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer().catch(console.error);
