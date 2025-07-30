# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Sistema de Gestão de Importações Biocol** (Biocol Import Management System) - a web application for managing complete import processes for Biocol Importadora e Distribuidora S/A. The system centralizes shipment control, documentation, customs workflow, and warehouse management.

## Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (modern design with rounded corners, Apple-style)
- **State Management**: Context API + React Query
- **Routing**: React Router
- **UI Components**: Headless UI + custom components

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Storage**: AWS S3 or similar
- **OCR/Document Extraction**: Tesseract.js + PDF parsing libraries

### Infrastructure
- **Deployment**: Docker containers
- **Cloud Provider**: AWS/Azure
- **Monitoring**: Structured logging

## Core Domain Models

### Key Entities
```typescript
// Main shipment entity
interface Embarque {
  id: string;
  numeroReferencia: string;
  tipoImportacao: 'CONTA_PROPRIA' | 'VIA_TRADE';
  unidade: 'CEARA' | 'SANTA_CATARINA';
  exportador: Exportador;
  status: StatusEmbarque;
  containers: Container[];
  documentos: Documento[];
}

// Workflow status enum
enum StatusEmbarque {
  PRE_EMBARQUE = 'PRE_EMBARQUE',
  CARREGADO_BORDO = 'CARREGADO_BORDO',
  EM_TRANSITO = 'EM_TRANSITO',
  CHEGADA_PORTO = 'CHEGADA_PORTO',
  PRESENCA_CARGA = 'PRESENCA_CARGA',
  REGISTRO_DI = 'REGISTRO_DI',
  CANAL_PARAMETRIZADO = 'CANAL_PARAMETRIZADO',
  LIBERADO_CARREGAMENTO = 'LIBERADO_CARREGAMENTO',
  AGENDAMENTO_RETIRADA = 'AGENDAMENTO_RETIRADA',
  ENTREGUE = 'ENTREGUE'
}

// Customs warehouse management
interface EntrepostoAduaneiro {
  id: string;
  embarqueId: string;
  tipoEntreposto: 'CLIA' | 'EADI';
  numeroDA: string;
  prazoVencimento: Date; // 180 days from registration
  saldoDisponivel: ItemSaldo[];
  retiradas: RetiradeEntreposto[];
}
```

## Main Features

### 1. Shipment Management (`Gestão de Embarques`)
- Complete shipment registration with workflow tracking
- Status management through 10 defined stages
- Container and document management
- Automatic alerts for delays and deadlines

### 2. Dashboard
- Real-time metrics and KPIs
- Interactive charts and performance graphs
- Intelligent filtering (by period, unit, type, status, exporter)
- Pending actions overview

### 3. Kanban Board
- Drag & drop workflow visualization
- Cards showing shipment status, delays, and next actions
- Quick actions for status updates

### 4. Customs Warehouse Management (`CLIA/EADI`)
- DA (Admission Declaration) workflow
- Partial withdrawal management with balance control
- 180-day deadline tracking
- Integration with customs systems

### 5. Document Processing
- Automatic OCR extraction from:
  - Bill of Lading (BL)
  - Air Waybill (AWB)
  - Commercial Invoice
  - Packing List
  - Certificate of Origin
  - COA (Certificate of Analysis)
- Automated data extraction for container numbers, ports, dates, etc.

## API Structure

### Main Endpoints
```typescript
// Shipments
GET /api/embarques
POST /api/embarques
PUT /api/embarques/:id
DELETE /api/embarques/:id

// Dashboard
GET /api/dashboard/metrics
GET /api/dashboard/alerts

// Customs Warehouses
POST /api/entrepostos
GET /api/entrepostos/:id/saldo
POST /api/entrepostos/:id/retiradas

// Documents
POST /api/documentos/upload
POST /api/documentos/extract
```

## External System Integrations

The system integrates with existing Biocol systems:
- **Focco ERP**: Financial data synchronization via webhooks
- **Ploomes CRM**: Customer data via API
- **Logmanager**: Cargo tracking
- **Conexos Cloud**: Customs data

## Development Phases

This project was designed in 5 phases:
1. **MVP** (4 weeks): Basic shipment registration, dashboard, authentication
2. **Workflow** (3 weeks): Kanban board, status management, alerts
3. **Warehouses** (4 weeks): CLIA/EADI flow, partial withdrawals, balance control
4. **Automation** (3 weeks): Document extraction, API integrations, advanced reports
5. **Refinements** (2 weeks): Performance optimization, final testing, production deploy

## Design System

- **Colors**: Modern palette with primary blue (#2563eb)
- **Typography**: Inter or SF Pro (Apple-like)
- **Components**: Rounded corners (8px-16px)
- **Spacing**: 8pt grid system
- **Animations**: Smooth micro-interactions

## Project Status

This repository currently contains only the PRD (Product Requirements Document). The actual implementation should follow the architecture and specifications outlined in `prd_biocol_import_system.md`.

## Development Notes

- No existing package.json or build configuration found
- No source code directories present yet
- Implementation should prioritize MVP features first
- Use agile methodology with weekly sprints
- Implement automated testing from the beginning
- Maintain continuous user feedback loop with Magnus (primary user)