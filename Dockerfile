# set image
FROM node:22.19.0

# set working directory
WORKDIR /usr/src/app

# copy files to container
COPY package.json package-lock.json ./

# run build/config commands
RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production

# declare envs
ENV DATABASE_URL="postgresql://localhost"
ENV CLOUDFLARE_ACCOUNT_ID="#"
ENV CLOUDFLARE_ACCESS_KEY="#"
ENV CLOUDFLARE_SECRET_ACCESS_KEY="#"
ENV CLOUDFLARE_BUCKET="#"
ENV CLOUDFLARE_PUBLIC_URL="http://localhost"

# expose port
EXPOSE 3333

# run startup commands (after build)
CMD ["npm", "start"]
