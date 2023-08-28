FROM public.ecr.aws/docker/library/node:lts as builder

ENV NODE_ENV build

WORKDIR /home/node

COPY package*.json prisma .env ./
RUN npm ci

COPY --chown=node:node . .
RUN npx prisma generate
RUN npm run build \
    && npm prune --production

# ---

FROM public.ecr.aws/docker/library/node:lts

ENV NODE_ENV production

WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/prisma/ ./prisma/
COPY --from=builder --chown=node:node /home/node/.env ./

CMD ["dist/src/main.js"]