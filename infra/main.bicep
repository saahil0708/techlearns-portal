targetScope = 'resourceGroup'

@description('Deployment environment name (e.g. dev, staging, prod)')
@allowed([
  'dev'
  'staging'
  'prod'
])
param environment string = 'prod'

@description('The Azure region for all deployed resources')
param location string = resourceGroup().location

@description('Application base prefix for naming resources')
param appPrefix string = 'codeplatform'

@description('Database administrator login username')
param dbAdminUsername string = 'codeplatform_admin'

@description('Database administrator password')
@secure()
param dbAdminPassword string

@description('JWT authentication secret key')
@secure()
param jwtSecret string

@description('Backend container image (e.g., myacr.azurecr.io/backend:latest or mcr.microsoft.com/azuredocs/aci-helloworld:latest)')
param backendImage string = 'mcr.microsoft.com/azuredocs/aci-helloworld:latest'

@description('Frontend container image (e.g., myacr.azurecr.io/frontend:latest or mcr.microsoft.com/azuredocs/aci-helloworld:latest)')
param frontendImage string = 'mcr.microsoft.com/azuredocs/aci-helloworld:latest'

// Generate standardized, unique resource names
var uniqueSuffix = uniqueString(resourceGroup().id)
var acrName = replace('${appPrefix}acr${uniqueSuffix}', '-', '')
var keyVaultName = take('${appPrefix}-kv-${uniqueSuffix}', 24)
var dbServerName = '${appPrefix}-pg-${uniqueSuffix}'
var redisName = '${appPrefix}-redis-${uniqueSuffix}'
var logAnalyticsName = '${appPrefix}-law-${uniqueSuffix}'
var containerAppEnvName = '${appPrefix}-cae-${uniqueSuffix}'
var backendAppName = '${appPrefix}-backend-${environment}'
var frontendAppName = '${appPrefix}-frontend-${environment}'

// 1. Azure Container Registry (ACR)
module acrModule 'modules/acr.bicep' = {
  name: 'acrDeployment'
  params: {
    location: location
    acrName: acrName
    acrSku: environment == 'prod' ? 'Standard' : 'Basic'
  }
}

// 2. Azure Key Vault
module keyVaultModule 'modules/keyvault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    location: location
    keyVaultName: keyVaultName
  }
}

// 3. Azure Database for PostgreSQL (Flexible Server)
module databaseModule 'modules/database.bicep' = {
  name: 'databaseDeployment'
  params: {
    location: location
    serverName: dbServerName
    administratorLogin: dbAdminUsername
    administratorLoginPassword: dbAdminPassword
    databaseName: 'codeplatform'
    skuName: environment == 'prod' ? 'Standard_D2ds_v5' : 'Standard_B1ms'
    skuTier: environment == 'prod' ? 'GeneralPurpose' : 'Burstable'
    storageSizeGB: 32
  }
}

// 4. Azure Cache for Redis
module redisModule 'modules/redis.bicep' = {
  name: 'redisDeployment'
  params: {
    location: location
    redisName: redisName
    redisSku: environment == 'prod' ? 'Standard' : 'Basic'
    redisFamily: 'C'
    redisCapacity: environment == 'prod' ? 1 : 0
  }
}

// 5. Container Apps Managed Environment & Log Analytics
module containerEnvModule 'modules/container-app-env.bicep' = {
  name: 'containerEnvDeployment'
  params: {
    location: location
    environmentName: containerAppEnvName
    logAnalyticsWorkspaceName: logAnalyticsName
  }
}

// 6. NestJS Backend Container App (API & GraphQL on Port 8000)
module backendAppModule 'modules/container-app.bicep' = {
  name: 'backendAppDeployment'
  params: {
    location: location
    appName: backendAppName
    environmentId: containerEnvModule.outputs.environmentId
    containerImage: backendImage
    targetPort: 8000
    isExternalIngress: true
    healthCheckPath: '/health'
    cpu: environment == 'prod' ? '1.0' : '0.5'
    memory: environment == 'prod' ? '2.0Gi' : '1.0Gi'
    minReplicas: environment == 'prod' ? 2 : 1
    maxReplicas: 10
    registryServer: acrModule.outputs.acrLoginServer
    registryUsername: acrModule.outputs.acrAdminUsername
    registryPassword: acrModule.outputs.acrAdminPassword
    secrets: [
      {
        name: 'db-connection-string'
        value: databaseModule.outputs.postgresConnectionString
      }
      {
        name: 'redis-password'
        value: redisModule.outputs.redisPrimaryKey
      }
      {
        name: 'jwt-secret'
        value: jwtSecret
      }
    ]
    envVars: [
      {
        name: 'NODE_ENV'
        value: 'production'
      }
      {
        name: 'PORT'
        value: '8000'
      }
      {
        name: 'DATABASE_URL'
        secretRef: 'db-connection-string'
      }
      {
        name: 'REDIS_HOST'
        value: redisModule.outputs.redisHostName
      }
      {
        name: 'REDIS_PORT'
        value: string(redisModule.outputs.redisSslPort)
      }
      {
        name: 'REDIS_PASSWORD'
        secretRef: 'redis-password'
      }
      {
        name: 'REDIS_TLS'
        value: 'true'
      }
      {
        name: 'JWT_SECRET'
        secretRef: 'jwt-secret'
      }
    ]
  }
}

// 7. Next.js Frontend Container App (SSR & Web Client on Port 3000)
module frontendAppModule 'modules/container-app.bicep' = {
  name: 'frontendAppDeployment'
  params: {
    location: location
    appName: frontendAppName
    environmentId: containerEnvModule.outputs.environmentId
    containerImage: frontendImage
    targetPort: 3000
    isExternalIngress: true
    healthCheckPath: '/'
    cpu: environment == 'prod' ? '1.0' : '0.5'
    memory: environment == 'prod' ? '2.0Gi' : '1.0Gi'
    minReplicas: environment == 'prod' ? 2 : 1
    maxReplicas: 10
    registryServer: acrModule.outputs.acrLoginServer
    registryUsername: acrModule.outputs.acrAdminUsername
    registryPassword: acrModule.outputs.acrAdminPassword
    envVars: [
      {
        name: 'NODE_ENV'
        value: 'production'
      }
      {
        name: 'PORT'
        value: '3000'
      }
      {
        name: 'NEXT_PUBLIC_API_URL'
        value: backendAppModule.outputs.url
      }
    ]
  }
// Outputs
output acrLoginServer string = acrModule.outputs.acrLoginServer
output keyVaultName string = keyVaultModule.outputs.keyVaultName
output postgresFqdn string = databaseModule.outputs.postgresFqdn
output redisHost string = redisModule.outputs.redisHostName
output backendApiUrl string = backendAppModule.outputs.url
output frontendWebUrl string = frontendAppModule.outputs.url
