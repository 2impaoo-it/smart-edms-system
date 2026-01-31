# Smart E-DMS Component Architecture

## Overview
State-of-the-art Enterprise Document Management System with Cyberpunk Aesthetics

## Color Palette
- **Background**: #030712 (Rich Black)
- **Surface**: #111827 (Gray 900)
- **Primary Glow**: #6366f1 (Indigo 500) → #a855f7 (Purple 500)
- **Accent**: #a855f7 (Purple 500)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

## Core Components

### Layout Components
- **`<MainLayout />`** - Root layout with sidebar, mobile nav, and cursor lighting
- **`<Sidebar />`** - Desktop vertical navigation with glass morphism
- **`<MobileNav />`** - Bottom mobile navigation bar
- **`<CursorLight />`** - Ambient cursor-following gradient effect

### Dashboard Components
- **`<StatCard />`** - Stat display with sparkline charts (uses Recharts)
- **`<ActivityFeed />`** - Real-time activity log with animations
- **`<StorageRing />`** - 3D donut chart showing storage usage
- **`<QuickActions />`** - Grid of quick action buttons
- **`<DocTable />`** - Document table with hover spotlight effects

### Signing Interface Components
- **`<SignaturePad />`** - Draggable signature stamps panel
- **`<DocumentCanvas />`** - PDF viewer with drag-and-drop signature placement
- **`<ChainOfCustody />`** - Vertical timeline with verification status

### Utility Components
- **`<Toast />`** - Toast notification system with auto-dismiss
- **`<Modal />`** - Spring-animated modal dialog
- **`<LoadingSkeleton />`** - Shimmer loading states
- **`<FloatingActionMenu />`** - FAB with expandable action menu

## Animation System

All animations use Motion (Framer Motion) with spring physics:
- **Damping**: 20
- **Stiffness**: 300
- **Type**: "spring"

## Key Features

### ✨ Visual Effects
- Holographic glassmorphism with backdrop blur
- Cursor-aware ambient lighting
- Gradient text effects
- Spotlight hover effects
- Shimmer loading animations

### 🎨 Design System
- Bento grid layout for dashboard
- Consistent border radius and spacing
- Glass morphism with subtle borders
- Gradient overlays on interactive elements
- Custom scrollbar styling

### 🔧 Functionality
- React Router for navigation
- React DnD for drag-and-drop signatures
- Recharts for data visualization
- Responsive mobile-first design
- Toast notifications for user feedback

## Responsive Breakpoints
- **Mobile**: < 768px (mobile nav visible)
- **Desktop**: ≥ 768px (sidebar visible)
- **Large**: ≥ 1024px (3-column bento grid)

## Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Established with tight letter spacing
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
