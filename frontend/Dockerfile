FROM node AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# ---------------- Development stage ----------------
FROM base AS development
WORKDIR /app
EXPOSE 3000
# Mount source code in docker-compose for live updates
# You don't need to copy files here; docker-compose volume will handle it
# React dev server runs on 3000
CMD ["npm", "run", "start"]  


FROM node AS builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

# serve with nginx
FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]