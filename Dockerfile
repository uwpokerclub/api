FROM uwpokerclub/app:latest AS app

FROM node:lts-alpine

WORKDIR /usr/app

COPY --from=app /usr/app /usr/app/dist/build

COPY . .

RUN apk add --no-cache --virtual .gyp python make g++
RUN npm install
RUN npm run build

CMD ["npm", "run", "start:dev"]

# CMD npm run migrate up \
#     && npm run start:prod
