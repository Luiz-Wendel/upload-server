# set image
FROM node:22.19.0 AS base

# RUN npm i -g pnpm

FROM base AS dependencies

# set working directory
WORKDIR /usr/src/app

# copy files to container
COPY package.json package-lock.json ./

# run build/config commands
RUN npm ci

FROM base AS build

WORKDIR /usr/src/app

COPY . .
# copy from dependencies
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

RUN npm run build
RUN npm prune --production

FROM node:22.19.0-alpine AS deploy

# set user
USER 1000

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json

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
# CMD ["npm", "start"]
CMD ["node", "dist/infra/http/server.js"]
