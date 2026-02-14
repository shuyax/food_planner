require("dotenv").config({
  path: (() => {
    switch (process.env.NODE_ENV) {
      case "test":
        return ".env.test";
      case "production":
        return ".env.prod";
      case "development":
      default:
        return ".env.dev";
    }
  })(),
});

const app = require("./app")

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.DB_HOST} port ${process.env.PORT}`)
})