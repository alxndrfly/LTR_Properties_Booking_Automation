# LTR Properties Booking Automation

A minimalistic web app that displays real estate property recommendations based on a UUID parameter.

## Features

- Accepts UUID via URL parameter
- Fetches JSON payload from Airtable
- Displays requested property with status
- Shows 4 recommended properties in responsive grid
- Image carousel for property photos
- Clean, Apple-inspired design with brand colors
- Loading and error states
- Responsive layout (mobile-friendly)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Airtable credentials:
     - `VITE_AIRTABLE_BASE_ID`: Your Airtable base ID
     - `VITE_AIRTABLE_API_KEY`: Your Airtable API key

3. Start development server:
```bash
npm run dev
```

4. Visit `http://localhost:5173/?uuid=your-uuid-here`

## Usage

The app expects a UUID parameter in the URL:
```
http://localhost:5173/?uuid=rec123456789
```

## Build

To build for production:
```bash
npm run build
```

## Design

- Colors: Black (80%), Red (10%), White (10%)
- Font: Helvetica
- Minimalistic, Apple-style design
- Responsive layout with dark theme