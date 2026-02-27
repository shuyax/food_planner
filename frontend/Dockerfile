FROM node AS builder
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
RUN apt-get update && apt-get install -y net-tools && rm -rf /var/lib/apt/lists/*

# serve with nginx
FROM nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]