# EV Charging Solution API Endpoints Documentation (To Partner)

## Basic Information

- **Base URL**: `https://api.evcharging.abc.com/api/v1`
- **Authentication**: API key authentication (x-api-key header)
- **Content Type**: `application/json`
- **Character Encoding**: UTF-8

## Authentication

All API requests require an API key in the request header:

```
x-api-key: your-api-key-here
```

Or use the Authorization header:

```
Authorization: Bearer your-api-key-here
```

## API Endpoints

### 1. Get Charger Status

**GET** `/chargers/{chargerId}/status`

Get real-time status information for a specific charger.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chargerId | string | Yes | Charger ID |

#### Response Example

```json
{
  "chargerId": "CHARGER_001",
  "status": "AVAILABLE",
  "success": true
}
```

#### Status Codes

- `200`: Success
- `401`: Unauthorized
- `404`: Charger not found

### 2. Update Charger Status

**PUT** `/chargers/{chargerId}/status`

Update status information for a specific charger.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chargerId | string | Yes | Charger ID |

#### Request Body

```json
{
  "status": "CHARGING"
}
```

#### Response Example

```json
{
  "chargerId": "CHARGER_001",
  "status": "CHARGING",
  "success": true
}
```

### 3. Control Charger On/Off

**POST** `/chargers/{chargerId}/control`

Remotely control the on/off status of a charger.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chargerId | string | Yes | Charger ID |

#### Request Body

```json
{
  "action": "TURN_ON",
  "reason": "User requested charging",
  "force": false
}
```

#### Response Example

```json
{
  "chargerId": "CHARGER_001",
  "action": "TURN_ON",
  "success": true,
  "timestamp": "2024-01-15T10:40:00Z"
}
```

### 4. Batch Get Charger Status

**GET** `/chargers/batch/status`

Get status for all chargers of a partner in batch.

#### Response Example

```json
{
  "chargers": [
    {
      "chargerId": "CHARGER_001",
      "status": "AVAILABLE",
      "success": true
    }
  ],
  "total": 1,
  "success": true
}
```

## Charger Status Enumeration

| Status | Description |
|--------|-------------|
| AVAILABLE | Available - Charger is idle and can start charging |
| BLOCKED | Blocked - Charger is blocked and cannot be used |
| CHARGING | Charging - Charger is currently charging a vehicle |
| INOPERATIVE | Faulty - Charger has malfunctioned and cannot be used |
| REMOVED | Removed - Charger has been removed |
| RESERVED | Reserved - Charger has been reserved |
| UNKNOWN | Unknown - Charger status is unknown |

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/chargers/CHARGER_001/status"
}
```

## Rate Limiting Rules

- Maximum 100 requests per minute
- Maximum 1000 requests per hour
- Returns 429 status code when limit is exceeded

## Version Control

API versioning is controlled through URL paths:
- Current version: `/api/v1`
- Future version: `/api/v2`

## Data Format

- All timestamps use ISO 8601 format
- Meter values use kWh units
- Coordinates use WGS84 coordinate system 