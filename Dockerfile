FROM ubuntu:16.04 AS builder

RUN apt-get update && apt-get install -y \
  curl \
  xz-utils

WORKDIR /opt

RUN curl -O https://nodejs.org/dist/v8.9.3/node-v8.9.3-linux-x64.tar.xz
RUN echo '86f3aa593315f0503d069e3f4805019583ab8d86c0244a83c795d1942e3f99b7  node-v8.9.3-linux-x64.tar.xz' > sha_correct && \
  sha256sum node-v8.9.3-linux-x64.tar.xz > sha_actual && \
  diff sha_correct sha_actual
RUN tar xf node-v8.9.3-linux-x64.tar.xz
ENV PATH="${PATH}:/opt/node-v8.9.3-linux-x64/bin"

WORKDIR /root

ADD package*.json ./
RUN npm install --production

FROM ubuntu:16.04

WORKDIR /root

COPY --from=builder /opt/node-v8.9.3-linux-x64/bin/node /usr/bin/node
COPY --from=builder /root/node_modules /root/node_modules
ADD .config.json index.js ./
ADD style style
ADD views views

CMD ["node", "/root/index.js"]
