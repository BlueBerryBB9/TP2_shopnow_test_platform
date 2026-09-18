```groovy
pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment') {
            steps {
                sh '''
                    node --version
                    npm --version
                    git --version
                    java -version || true
                    chromium --version || true
                '''
            }
        }

        stage('Installation') {
            steps {
                sh '''
                    npm ci \
                        --cache /var/jenkins_home/.npm-cache \
                        --prefer-offline \
                        --no-audit \
                        --no-fund
                '''
            }
        }

        stage('Tests unitaires') {
            steps {
                sh 'npm run test:unit'
            }
        }

        stage('Tests API') {
            steps {
                sh 'npm run test:integration'
            }
        }

        stage('Coverage') {
            steps {
                sh '''
                    rm -rf coverage
                    npm run test:coverage
                    test -f coverage/lcov.info
                '''
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'coverage/**',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
            }
        }

        stage('SonarQube') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        def qualityGate = waitForQualityGate()

                        if (qualityGate.status != 'OK') {
                            error "Quality Gate SonarQube non conforme : ${qualityGate.status}"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline termine.'
        }
    }
}
```
