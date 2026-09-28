@description('The Azure region where PostgreSQL Flexible Server will be deployed')
param location string = resourceGroup().location

@description('The name of the PostgreSQL Flexible Server')
param serverName string

@description('The database administrator username')
param administratorLogin string = 'codeplatform_admin'

@description('The database administrator password')
@secure()
param administratorLoginPassword string

@description('The database name to create')
param databaseName string = 'codeplatform'

@description('The PostgreSQL server version')
@allowed([
  '14'
  '15'
  '16'
])
param version string = '16'

@description('The SKU name for PostgreSQL Flexible Server')
param skuName string = 'Standard_B1ms'

@description('The SKU tier for PostgreSQL Flexible Server')
@allowed([
  'Burstable'
  'GeneralPurpose'
  'MemoryOptimized'
])
param skuTier string = 'Burstable'

@description('Storage size in GB')
param storageSizeGB int = 32

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-03-01-preview' = {
  name: serverName
  location: location
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    version: version
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
    storage: {
      storageSizeGB: storageSizeGB
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Allow all Azure services to connect
resource allowAzureServicesFirewall 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-03-01-preview' = {
  parent: postgresServer
  name: 'AllowAllAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-03-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

output postgresFqdn string = postgresServer.properties.fullyQualifiedDomainName
output postgresDatabaseName string = database.name
output postgresAdminUser string = administratorLogin

