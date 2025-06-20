# EV Charging Solution API

A comprehensive REST API for Electric Vehicle charging management, built with NestJS and TypeScript. This API allows third-party partners to integrate charging services seamlessly.

## 🚀 Features

- **Remote Charger Control**: Turn chargers on/off remotely
- **Real-time Status Monitoring**: Get charger status and meter values
- **High Concurrency Support**: Supports real-time status updates for 1 million chargers
- **Secure Authentication**: API key authentication mechanism
- **Rate Limiting Protection**: Prevents API abuse
- **Complete Documentation**: Swagger API documentation + Docusaurus site
- **Multi-language Clients**: JavaScript and Python examples

## 📋 System Requirements

- Node.js 22+ (use `nvm use 22` to switch to the correct version)
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

## 🏗️ System Architecture

### AWS Cloud Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                AWS Cloud                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌────────────┐                                                             │
│  │ Route 53   │                                                             │
│  │   (DNS)    │                                                             │
│  └─────┬──────┘                                                             │
│        │                                                                    │
│  ┌─────▼──────┐                                                             │
│  │ CloudFront │                                                             │
│  │   (CDN)    │                                                             │
│  └─────┬──────┘                                                             │
│        │                                                                    │
│  ┌─────▼──────────┐                                                         │
│  │  API Gateway   │                                                         │
│  │ (Rate Limiting)│                                                         │
│  └─────┬──────────┘                                                         │
│        │                                                                    │
│  ┌─────▼────────────────────────────────────────────────────────────────┐   │
│  │         Application Load Balancer (ALB)                             │   │
│  │   (Health Checks & SSL Termination)                                 │   │
│  └─────┬───────────────────────────────────────────────────────────────┘   │
│        │                                                                    │
│  ┌─────▼────────────────────────────────────────────────────────────────┐   │
│  │                        ECS Cluster                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │   NestJS API    │  │   NestJS API    │  │   NestJS API    │     │   │
│  │  │   Container 1   │  │   Container 2   │  │   Container N   │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Data Layer                                   │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │   RDS Aurora    │  │   ElastiCache   │  │   DynamoDB      │     │   │
│  │  │   (PostgreSQL)  │  │   (Redis)       │  │   (Sessions)    │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Business Process Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           Business Process Flow                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Partner   │───▶│   API Key   │───▶│  Rate Limit │───▶│  Validation │  │
│  │ Registration│    │ Generation  │    │   Check     │    │   Layer     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                     │      │
│                                                                     ▼      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Response    │◀───│  Business   │◀───│   Cache     │◀───│  Database   │  │
│  │   Data      │    │   Logic     │    │   Layer     │    │   Layer     │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

### Key Business Processes

#### 1. Partner Onboarding Process
```
Partner Registration → API Key Generation → Rate Limit Configuration → 
Charger Assignment → Testing & Validation → Production Activation
```

#### 2. Charger Management Process
```
Charger Registration → Status Monitoring → Real-time Updates → 
Control Commands → Meter Reading → Billing Integration
```

#### 3. API Request Flow
```
Request → Authentication → Rate Limiting → Validation → 
Business Logic → Cache Check → Database Query → Response
```

### Expansion Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Multi-Cloud & Hybrid Architecture                   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Edge Computing Layer                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │ AWS Lambda  │  │ Azure Func  │  │ GCP Cloud   │  │ Edge Nodes  │ │   │
│  │  │   Edge      │  │   Edge      │  │   Functions │  │   (5G/IoT)  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Cloud Provider Layer                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │   │
│  │  │     AWS Cloud   │  │   Azure Cloud   │  │   GCP Cloud     │      │   │
│  │  │   (Primary)     │  │   (Secondary)   │  │   (Tertiary)    │      │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Data & Analytics Layer                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │   Data      │  │   Real-time │  │   Machine   │  │   Business  │ │   │
│  │  │  Warehouse  │  │  Analytics  │  │   Learning  │  │ Intelligence│ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Expansion Scenarios

#### 1. Multi-Cloud Strategy
- **Primary**: AWS (Current implementation)
- **Secondary**: Azure (Disaster recovery & regional expansion)
- **Tertiary**: GCP (Specialized services & cost optimization)

#### 2. Edge Computing Integration
- **5G Network Integration**: Low-latency charging control
- **IoT Device Management**: Direct charger communication
- **Local Processing**: Reduced cloud dependency

#### 3. Advanced Analytics
- **Predictive Maintenance**: ML-based charger health monitoring
- **Usage Pattern Analysis**: Optimize charging station placement
- **Dynamic Pricing**: Real-time pricing based on demand

#### 4. Blockchain Integration
- **Payment Processing**: Decentralized payment verification
- **Energy Trading**: Peer-to-peer energy exchange
- **Smart Contracts**: Automated billing and settlements

#### 5. Microservices Evolution
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Microservices Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Charger    │  │   Payment   │  │   User      │  │   Analytics │        │
│  │  Service    │  │   Service   │  │   Service   │  │   Service   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Partner    │  │   Billing   │  │   Location  │  │   Security  │        │
│  │  Service    │  │   Service   │  │   Service   │  │   Service   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway & Service Mesh                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Evolution

#### Phase 1: Current (Monolithic)
- NestJS + TypeScript
- PostgreSQL + Redis
- AWS ECS + ALB

#### Phase 2: Microservices (Near-term)
- NestJS Microservices
- Event-driven architecture
- Service mesh (Istio/Linkerd)

#### Phase 3: Cloud-Native (Mid-term)
- Kubernetes orchestration
- Serverless functions
- Multi-cloud deployment

#### Phase 4: Edge Computing (Long-term)
- Edge nodes deployment
- 5G network integration
- IoT device management

### Scalability Roadmap

| Phase | Chargers | Partners | Regions | Features |
|-------|----------|----------|---------|----------|
| 1.0   | 1M       | 10       | 1       | Basic API |
| 2.0   | 5M       | 50       | 3       | Microservices |
| 3.0   | 10M      | 100      | 5       | Multi-cloud |
| 4.0   | 50M      | 500      | 10      | Edge computing |

## 🛠️ Installation and Setup

### 1. Clone the project

```bash
git clone <repository-url>
cd ev-charging-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment configuration

Copy the environment variables file:

```bash
cp env.example .env
```

Edit the `.env` file to configure database and Redis connection information.

### 4. Start the application

```bash
# Development mode
npm run start

# Production mode
npm run build
npm run start:prod
```

## 📚 API Documentation

### Swagger Documentation

After starting the application, access the Swagger documentation:

```
http://localhost:3000/api/docs
```

### Docusaurus Documentation Site

For comprehensive documentation with examples and guides:

```bash
cd /docs-site
npm i
# Start documentation site
npm run docs:start

# Access at http://localhost:3001
```

## 🔐 Authentication and Authorization

### API Key Authentication

All API requests require an API key in the request header:

```bash
x-api-key: your-api-key-here
```

Or use the Authorization header:

```bash
Authorization: Bearer your-token-here
```

### Partner Management

- Each partner has a unique API key
- Supports charger quantity limits
- Supports partner status management

## 📊 Performance Metrics

### Scalability Design

- **Number of Chargers**: Supports 1 million chargers
- **Partners**: Supports 10 partners
- **Status Update Frequency**: Updates per second
- **Concurrent Requests**: 100 per minute, 1000 per hour

### Caching Strategy

- Redis caching for hot data
- 30-second cache expiration
- Real-time status update push

## 🛡️ Security Measures

### Network Security

- HTTPS forced encryption
- CORS configuration
- Helmet security headers
- Request compression

### Application Security

- API key authentication
- Request rate limiting
- Input validation
- SQL injection protection

### Data Security

- Database connection encryption
- Sensitive data encrypted storage
- Audit log recording

## 📝 Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/chargers/CHARGER_001/status"
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run individually
docker build -t ev-charging-api .
docker run -p 3000:3000 ev-charging-api
```

### Production Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 📖 Documentation Management

### Available Commands

| Command | Description |
|---------|-------------|
| `npm run docs:start` | Start documentation development server |
| `npm run docs:build` | Build documentation for production |
| `npm run docs:serve` | Serve built documentation locally |
| `npm run docs:deploy` | Deploy documentation to docs/_build |
| `npm run docs:clean` | Clean documentation build files |

## 🧪 Unit

### Run Tests

```bash
# Unit tests
npm run test

### Test Structure

- **Unit Tests**: Individual component testing
- **Integration Tests**: Database and Redis integration
- **E2E Tests**: API endpoint testing
- **Performance Tests**: Load testing

## 📈 Monitoring and Logging

### Logging

- Structured JSON logging with Winston
- Daily log rotation
- Error tracking and monitoring
- Request/response logging

### Health Checks

```bash
# Health check endpoint
GET /api/v1/health
```

### Metrics

- API response times
- Error rates
- System resource usage
- Business metrics

## 🔄 Development Workflow

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

### Git Hooks

- Pre-commit linting
- Pre-push testing
- Commit message validation

## 📞 Support

### Documentation

- **API Documentation**: Swagger at `/api/docs`
- **Developer Guide**: Docusaurus site at `http://localhost:3001`
- **Code Examples**: JavaScript and Python clients

### Community

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Stack Overflow**: Tagged with `ev-charging-api`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📋 Changelog

### v1.0.0 (2025-01-01)

- Initial release
- Complete API implementation
- Documentation site
- Docker support
- Comprehensive testing

## 📁 Project Structure

The following is an overview of the main folders in the codebase and their purposes:

```
pe-backend/
├── src/                  # Main source code
│   ├── admin/            # Admin-related modules and services
│   ├── auth/             # Authentication, API key, and partner management
│   ├── chargers/         # Charger business logic, controllers, DTOs, services
│   ├── common/           # Common utilities, logger, and shared modules
│   ├── entities/         # TypeORM entity definitions (database models)
│   ├── migrations/       # Database migration scripts
│   ├── health/           # Health check endpoints
│   └── ...               # Other feature modules
├── examples/             # Example client code (e.g., Python client)
├── docs-site/            # Docusaurus documentation site
├── test/                 # (If present) End-to-end and integration tests
├── package.json          # Project dependencies and scripts
├── README.md             # Project documentation
└── ...                   # Other configuration and environment files
```

- **src/**: Main application source code, organized by domain/module.
- **entities/**: All database models (TypeORM entities).
- **migrations/**: Database schema and seed migrations.
- **auth/**: Authentication, partner, and API key logic.
- **chargers/**: Charger business logic, controllers, and DTOs.
- **common/**: Shared utilities and services (e.g., logger).
- **admin/**: Admin-specific features and services.
- **health/**: Health check endpoints for monitoring.
- **examples/**: Example client code for API usage.
- **docs-site/**: Documentation site source (Docusaurus).
- **test/**: (If present) Additional tests.
- **package.json**: Project dependencies and scripts.
- **README.md**: Project documentation and instructions.

---
