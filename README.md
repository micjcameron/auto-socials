# Auto-Socials: Automated Viral Video Generation System

## 🚀 Overview

An automated system built with NestJS that scrapes product ideas, generates affiliate links, creates viral videos, and distributes content to social platforms.

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Automation**: n8n workflows
- **Video Processing**: FFmpeg, ElevenLabs, OpenAI
- **Distribution**: Telegram, TikTok, Instagram, YouTube
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
auto-socials/
├── src/
│   ├── entities/           # TypeORM entities
│   ├── scrapers/           # Data mining modules
│   ├── generators/         # Content generation modules
│   ├── distributors/       # Social media posting modules
│   ├── database/           # Database configuration
│   └── main.ts            # Application entry point
├── n8n/                   # n8n automation workflows
├── docker-compose.yml     # Main Docker Compose file
├── Dockerfile            # Application Dockerfile
└── config/               # Configuration files
```

## 🗄️ Database Schema

### Core Entities
- **Opportunity**: Scraped product opportunities
- **Video**: Generated video content
- **Post**: Distributed social media posts
- **Analytics**: Performance tracking
- **AffiliateEarnings**: Revenue tracking

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp config/env.example .env

# Edit .env with your API keys
nano .env
```

### 2. Start Services
```bash
# Start all services
docker-compose up -d

# Or start individual services
docker-compose up -d postgres redis n8n
docker-compose up -d auto-socials
```

### 3. Access Services
- **Auto-Socials API**: http://localhost:3000
- **n8n Workflows**: http://localhost:5678
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Run tests
npm run test
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate

# Run migrations
npm run migration:run
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Service health status

### Manual Triggers
- `POST /api/scrape` - Run all scrapers
- `POST /api/generate` - Generate videos
- `POST /api/distribute` - Distribute content

### Status
- `GET /api/status` - System statistics

## 🔄 Scheduled Tasks

- **6:00 AM**: Daily scraping
- **8:00 AM**: Content generation
- **9:00 AM, 3:00 PM, 9:00 PM**: Content distribution

## 💰 Monetization Strategy

### Affiliate Marketing
1. **Whop**: Register as creator/affiliate
2. **Clickbank**: Create affiliate account
3. **Commission Tracking**: Monitor conversions

### Revenue Streams
- Affiliate commissions (5-50% per sale)
- Platform monetization
- Sponsored content

## 🎯 Video Styles

1. **Static Image + Captions + Voice**
2. **AI-Generated Background**
3. **Meme-Style Motion (Remotion)**
4. **Custom Templates**

## 🛠️ Configuration

### Required API Keys
- OpenAI API Key
- ElevenLabs API Key
- Telegram Bot Token
- Whop API Key
- Clickbank API Key

### Environment Variables
See `config/env.example` for all available options.

## 📈 Monitoring

- **Logs**: `./logs/app.log`
- **Database**: PostgreSQL with TypeORM logging
- **Health Checks**: Built-in health endpoints

## 🔒 Security

- Environment-based configuration
- Database connection pooling
- API rate limiting (to be implemented)
- Input validation (to be implemented)

## 🚀 Deployment

### Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling
- Horizontal scaling with load balancers
- Database read replicas
- Redis clustering

---

*Ready to build your viral video empire? Let's get started! 🎬*
