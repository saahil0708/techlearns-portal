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

// 1. User-Assigned Managed Identity for Container Apps to pull from ACR
resource acrPullIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${appPrefix}-acrpull-id-${uniqueSuffix}'
  location: location
}

// 2. Azure Container Registry (ACR)
module acrModule 'modules/acr.bicep' = {
  name: 'acrDeployment'
  params: {
    location: location
    acrName: acrName
    acrSku: environment == 'prod' ? 'Standard' : 'Basic'
  }
}

resource acrExisting 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: acrName
  dependsOn: [
    acrModule
  ]
}

// Assign AcrPull role (7f951dda-4ed3-4680-a7ca-43fe172d538d) to the managed identity on the specific ACR
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrExisting.id, acrPullIdentity.properties.principalId, 'AcrPull')
  scope: acrExisting
  properties: {
    principalId: acrPullIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  }
}

// 3. Azure Key Vault
module keyVaultModule 'modules/keyvault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    location: location
    keyVaultName: keyVaultName
  }
}

// 4. Azure Database for PostgreSQL (Flexible Server)
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

// 5. Azure Cache for Redis
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

// Retrieve Redis keys without exposing primaryKey as a module output
resource redisExisting 'Microsoft.Cache/redis@2023-08-01' existing = {
  name: redisName
  dependsOn: [
    redisModule
  ]
}

// 6. Container Apps Managed Environment & Log Analytics
module containerEnvModule 'modules/container-app-env.bicep' = {
  name: 'containerEnvDeployment'
  params: {
    location: location
    environmentName: containerAppEnvName
    logAnalyticsWorkspaceName: logAnalyticsName
  }
}

// 7. NestJS Backend Container App (API & GraphQL on Port 8000)
module backendAppModule 'modules/container-app.bicep' = {
  name: 'backendAppDeployment'
  dependsOn: [
    acrPullRoleAssignment
  ]
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
    userAssignedIdentityId: acrPullIdentity.id
    secrets: [
      {
        name: 'db-connection-string'
        value: 'postgresql://${dbAdminUsername}:${uriComponent(dbAdminPassword)}@${databaseModule.outputs.postgresFqdn}:5432/codeplatform?schema=public&sslmode=require'
      }
      {
        name: 'redis-password'
        value: redisExisting.listKeys().primaryKey
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

// 8. Next.js Frontend Container App (SSR & Web Client on Port 3000)
module frontendAppModule 'modules/container-app.bicep' = {
  name: 'frontendAppDeployment'
  dependsOn: [
    acrPullRoleAssignment
  ]
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
    userAssignedIdentityId: acrPullIdentity.id
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
}

// Outputs
output acrLoginServer string = acrModule.outputs.acrLoginServer
output keyVaultName string = keyVaultModule.outputs.keyVaultName
output postgresFqdn string = databaseModule.outputs.postgresFqdn
output redisHost string = redisModule.outputs.redisHostName
output backendAppName string = backendAppName
output frontendAppName string = frontendAppName
output backendApiUrl string = backendAppModule.outputs.url
output frontendWebUrl string = frontendAppModule.outputs.url
