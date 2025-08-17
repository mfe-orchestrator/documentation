# Using External Database and Cache

## Introduction

For production environments, it is highly recommended to use external database and cache services instead of embedded instances. This ensures:
- Higher reliability
- Better performance
- Easier maintenance
- Horizontal scalability
- Simplified backup and recovery

## MongoDB Configuration

1. **Set up MongoDB Instance**
   - Use a managed service (e.g., MongoDB Atlas, AWS DocumentDB, or self-hosted MongoDB)
   - Ensure the instance is accessible from your production environment
   - Configure proper authentication and network access rules

2. **Configure Environment Variables**

```bash
NOSQL_DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-address>/<database>?retryWrites=true&w=majority
```

## External Redis Configuration

1. **Create a Redis instance**
   - Use a managed service (e.g., Redis Cloud, AWS ElastiCache, Google Memorystore)
   - Configure persistence based on your needs

2. **Configure environment variables**

```bash
REDIS_URL=your-redis-host.url
REDIS_PASSWORD=secure_password
```
