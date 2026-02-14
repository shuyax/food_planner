from node
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
EXPOSE 4000
CMD ["node", "src/server.js"]