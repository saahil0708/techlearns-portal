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

@description('Application base name for Cloud Adoption Framework (CAF) resource naming')
param appPrefix string = 'codeplatform'

@description('Database administrator login username')
param dbAdminUsername string = 'codeplatform_admin'

@description('Database administrator password')
@secure()
param dbAdminPassword string

@description('Optional override for the Storage Account name to preserve existing accounts during incremental deployments')
param customStorageAccountName string = ''

@description('Optional override for the PostgreSQL server name to preserve existing databases during incremental deployments')
param customDbServerName string = ''

@description('JWT authentication secret key')
@secure()
param jwtSecret string

@description('Backend container image (e.g. myacr.azurecr.io/backend:latest or mcr.microsoft.com/azuredocs/aci-helloworld:latest)')
param backendImage string = 'mcr.microsoft.com/azuredocs/aci-helloworld:latest'

@description('Frontend container image (e.g. myacr.azurecr.io/frontend:latest or mcr.microsoft.com/azuredocs/aci-helloworld:latest)')
param frontendImage string = 'mcr.microsoft.com/azuredocs/aci-helloworld:latest'

// ============================================================================
// AZURE CLOUD ADOPTION FRAMEWORK (CAF) RESOURCE NAMING CONVENTIONS
// ============================================================================
var uniqueSuffix = uniqueString(resourceGroup().id)
var cleanAppPrefix = replace(replace(toLower(appPrefix), '-', ''), '_', '')
var normalizedAppPrefix = replace(toLower(appPrefix), '_', '-')
var cleanEnv = toLower(environment)

// 1. Storage Account: st<workload><env><unique> (3-24 chars, strictly alphanumeric lowercase)
// Preserves existing default account naming while supporting custom override and length bounds
var storageAccountName = !empty(customStorageAccountName)
  ? customStorageAccountName
  : (cleanAppPrefix == 'codeplatform'
      ? take('st${cleanAppPrefix}${cleanEnv}${uniqueSuffix}', 24)
      : 'st${take(cleanAppPrefix, 11)}${take(cleanEnv, 6)}${take(uniqueSuffix, 5)}')

// 2. Blob Containers: <workload>-<purpose>-<env> (3-63 chars, lowercase, single hyphens)
var blobContainerName = '${normalizedAppPrefix}-uploads-${cleanEnv}'
var publicMediaContainerName = '${normalizedAppPrefix}-media-${cleanEnv}'

// 3. Azure Container Registry: cr<workload><env><unique> (5-50 chars, strictly alphanumeric lowercase)
var acrName = take('cr${take(cleanAppPrefix, 20)}${cleanEnv}${take(uniqueSuffix, 5)}', 50)

// 4. Azure Key Vault: kv-<workload>-<env>-<unique> (3-24 chars, alphanumeric + hyphens)
var keyVaultName = take('kv-${take(normalizedAppPrefix, 10)}-${cleanEnv}-${take(uniqueSuffix, 5)}', 24)

// 5. Azure Database for PostgreSQL: psql-<workload>-<env>-<unique> (3-63 chars, alphanumeric + hyphens)
var dbServerName = !empty(customDbServerName) ? customDbServerName : take('psql-${normalizedAppPrefix}-${cleanEnv}-${uniqueSuffix}', 63)

// 6. Azure Cache for Redis: redis-<workload>-<env>-<unique>
var redisName = take('redis-${normalizedAppPrefix}-${cleanEnv}-${uniqueSuffix}', 63)

// 7. Log Analytics Workspace: log-<workload>-<env>-<unique>
var logAnalyticsName = take('log-${normalizedAppPrefix}-${cleanEnv}-${uniqueSuffix}', 63)

// 8. Container Apps Managed Environment: cae-<workload>-<env>-<unique>
var containerAppEnvName = take('cae-${normalizedAppPrefix}-${cleanEnv}-${uniqueSuffix}', 32)

// 9. Container Apps (Microservices): ca-<workload>-<tier>-<env>
var backendAppName = take('ca-${normalizedAppPrefix}-backend-${cleanEnv}', 32)
var frontendAppName = take('ca-${normalizedAppPrefix}-frontend-${cleanEnv}', 32)

// 10. Managed Identity: id-<workload>-<purpose>-<env>-<unique>
var acrPullIdentityName = take('id-${normalizedAppPrefix}-acrpull-${cleanEnv}-${uniqueSuffix}', 128)

// ============================================================================
// 1. User-Assigned Managed Identity (for ACR Pull)
// ============================================================================
resource acrPullIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: acrPullIdentityName
  location: location
}

// ============================================================================
// 2. Azure Container Registry (ACR)
// ============================================================================
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

// Assign AcrPull role (7f951dda-4ed3-4680-a7ca-43fe172d538d) to the managed identity on the ACR
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(acrExisting.id, acrPullIdentity.properties.principalId, 'AcrPull')
  scope: acrExisting
  properties: {
    principalId: acrPullIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
  }
}

// ============================================================================
// 3. Azure Storage Account & Blob Containers (Private Uploads & Public Media)
// ============================================================================
module storageModule 'modules/storage.bicep' = {
  name: 'storageDeployment'
  params: {
    location: location
    storageAccountName: storageAccountName
    storageSku: environment == 'prod' ? 'Standard_GRS' : 'Standard_LRS'
    containerName: blobContainerName
    publicMediaContainerName: publicMediaContainerName
    allowBlobPublicAccess: true
  }
}

resource storageExisting 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
  dependsOn: [
    storageModule
  ]
}

// ============================================================================
// 4. Azure Key Vault
// ============================================================================
module keyVaultModule 'modules/keyvault.bicep' = {
  name: 'keyVaultDeployment'
  params: {
    location: location
    keyVaultName: keyVaultName
  }
}

// ============================================================================
// 5. Azure Database for PostgreSQL (Flexible Server)
// ============================================================================
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

// ============================================================================
// 6. Azure Cache for Redis
// ============================================================================
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

resource redisExisting 'Microsoft.Cache/redis@2023-08-01' existing = {
  name: redisName
  dependsOn: [
    redisModule
  ]
}

// ============================================================================
// 7. Container Apps Managed Environment & Log Analytics
// ============================================================================
module containerEnvModule 'modules/container-app-env.bicep' = {
  name: 'containerEnvDeployment'
  params: {
    location: location
    environmentName: containerAppEnvName
    logAnalyticsWorkspaceName: logAnalyticsName
  }
}

// ============================================================================
// 8. NestJS Backend Container App (API & GraphQL on Port 8000)
// ============================================================================
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
        name: 'storage-connection-string'
        value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageExisting.listKeys().keys[0].value};EndpointSuffix=core.windows.net'
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
        name: 'AZURE_STORAGE_CONNECTION_STRING'
        secretRef: 'storage-connection-string'
      }
      {
        name: 'AZURE_STORAGE_ACCOUNT_NAME'
        value: storageAccountName
      }
      {
        name: 'AZURE_STORAGE_CONTAINER_NAME'
        value: blobContainerName
      }
      {
        name: 'JWT_SECRET'
        secretRef: 'jwt-secret'
      }
    ]
  }
}

// ============================================================================
// 9. Next.js Frontend Container App (SSR & Web Client on Port 3000)
// ============================================================================
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

// ============================================================================
// OUTPUTS
// ============================================================================
output acrLoginServer string = acrModule.outputs.acrLoginServer
output acrName string = acrName
output storageAccountName string = storageAccountName
output blobContainerName string = blobContainerName
output publicMediaContainerName string = publicMediaContainerName
output keyVaultName string = keyVaultModule.outputs.keyVaultName
output postgresFqdn string = databaseModule.outputs.postgresFqdn
output redisHost string = redisModule.outputs.redisHostName
output backendAppName string = backendAppName
output frontendAppName string = frontendAppName
output backendApiUrl string = backendAppModule.outputs.url
output frontendWebUrl string = frontendAppModule.outputs.url
