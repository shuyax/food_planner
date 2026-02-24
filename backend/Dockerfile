FROM node AS base
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# -------- Test stage --------
FROM base AS test
CMD ["npm", "run", "test"]

# -------- Development stage --------
FROM base AS development
CMD ["npm", "run", "dev"]


# -------- Production --------
FROM node AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 4000
CMD ["node", "src/server.js"]