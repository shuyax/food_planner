const PORT = process.env.PORT || 4000;
const HOST = process.env.DB_HOST || "localhost";

export const BASEURL = `http://${HOST}:${PORT}`;
