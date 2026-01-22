require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env.dev"
});

const app = require("./app")

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.DB_HOST} port ${process.env.PORT}`)
})