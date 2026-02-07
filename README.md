# Dendro-Meet

Dendro-Meet is a collaborative meeting platform designed to integrate real-time communication with automated orchestration. It uses Tambo AI to manage tools and visualizations during live sessions.

[**Live Demo**](https://dendro-meet.vercel.app/)

[![Watch the Demo](https://img.youtube.com/vi/ptC1C5k1jOo/0.jpg)](https://www.youtube.com/watch?v=ptC1C5k1jOo)

## Overview

The platform combines video conferencing with a dynamic interface that adapts to the conversation. It includes features for real-time polling, data visualization, and interactive 3D elements, all managed by an intelligent backend system.

## Tambo AI Integration

Tambo AI serves as the orchestration layer for the application. It processes meeting context and triggers specific UI components and tools based on the discussion. This allows for:

*   Automatic generation of productivity tools like timers and agendas.
*   Real-time rendering of charts and maps based on spoken data.
*   Coordination of shared states across all participants.

## Technology Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS
*   **Real-time Communication**: LiveKit
*   **State Management**: Supabase
*   **Orchestration**: Tambo AI

## Architecture

The application is built on a modular architecture:

1.  **Video Layer**: Manages audio and video streams.
2.  **Orchestration Layer**: Processes events and signals to control the interface.
3.  **Presentation Layer**: Renders the dynamic components and tools.
4.  **Data Layer**: Handles state synchronization and persistence.

## Getting Started

### Prerequisites

*   Node.js (version 18 or higher)
*   npm

### Local Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure the environment variables in a `.env` file:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
