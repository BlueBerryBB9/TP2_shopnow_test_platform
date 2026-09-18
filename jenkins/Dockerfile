FROM jenkins/jenkins:lts-jdk21

USER root

# ============================================================
# Outils système
# ============================================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        xz-utils \
        chromium \
        git && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# Node.js 22 : runtime applicatif
# (npm ci, mocha, nyc, supertest)
# ============================================================
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
        | gpg --dearmor -o /usr/share/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
        > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# Node.js 18 : runtime DÉDIÉ au scanner SonarQube
# ------------------------------------------------------------
# SonarQube 9.9 (analyseur JavaScript) recommande Node 18.
# Avec Node 22 le scanner affiche :
#   WARN Node.js version 22 is not recommended ...
#   Sensor JavaScript analysis ... time=406821ms   (~6 min 47 s pour 4 fichiers)
# ce qui faisait dépasser le timeout Jenkins.
#
# Node 18 est installé dans /opt/node18 (HORS du PATH) pour ne pas
# toucher au Node 22 utilisé par les tests. Le Jenkinsfile pointe
# dessus via -Dsonar.nodejs.executable.
# ============================================================
ARG NODE18_VERSION=18.20.8
ARG NODE18_ARCH=x64
RUN curl -fsSL "https://nodejs.org/dist/v${NODE18_VERSION}/node-v${NODE18_VERSION}-linux-${NODE18_ARCH}.tar.xz" \
        -o /tmp/node18.tar.xz && \
    mkdir -p /opt/node18 && \
    tar -xJf /tmp/node18.tar.xz -C /opt/node18 --strip-components=1 && \
    rm -f /tmp/node18.tar.xz

# ============================================================
# Installation du Docker CLI
# ============================================================
RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
        | gpg --dearmor -o /usr/share/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] https://download.docker.com/linux/debian trixie stable" \
        > /etc/apt/sources.list.d/docker.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends docker-ce-cli && \
    rm -rf /var/lib/apt/lists/*

# ============================================================
# Vérification des versions
# ============================================================
RUN echo "========================================" && \
    echo "Versions installées dans Jenkins" && \
    echo "========================================" && \
    echo "Java:" && \
    java -version && \
    echo "Node.js (tests):" && \
    node --version && \
    echo "npm:" && \
    npm --version && \
    echo "Node.js (analyseur SonarQube):" && \
    /opt/node18/bin/node --version && \
    echo "Git:" && \
    git --version && \
    echo "Chromium:" && \
    chromium --version && \
    echo "Docker CLI:" && \
    docker --version && \
    echo "========================================"

USER jenkins
