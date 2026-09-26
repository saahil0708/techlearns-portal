@description('The Azure region where Redis Cache will be deployed')
param location string = resourceGroup().location

@description('The name of the Azure Cache for Redis')
param redisName string

@description('The SKU of the Redis cache')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param redisSku string = 'Basic'

@description('The SKU family of the Redis cache')
@allowed([
  'C'
  'P'
])
param redisFamily string = 'C'

@description('The capacity of the Redis cache (0 = 250MB, 1 = 1GB, 2 = 2.5GB)')
param redisCapacity int = 0

resource redis 'Microsoft.Cache/redis@2023-08-01' = {
  name: redisName
  location: location
  properties: {
    sku: {
      name: redisSku
      family: redisFamily
      capacity: redisCapacity
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

output redisId string = redis.id
output redisHostName string = redis.properties.hostName
output redisSslPort int = redis.properties.sslPort
output redisPrimaryKey string = redis.listKeys().primaryKey
