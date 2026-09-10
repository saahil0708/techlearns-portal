FROM ubuntu:24.04

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       bash gcc g++ openjdk-21-jdk-headless nodejs python3 \
    && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /usr/local/bin/codeplatform-judge
RUN chmod 0555 /usr/local/bin/codeplatform-judge

USER 1000:1000
WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/codeplatform-judge"]
