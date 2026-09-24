# Animation Builder

Animation Builder is a visual tool for creating, customizing, previewing, and exporting CSS animations for use in AEM projects.

The project started as a catalog of reusable CSS animations and evolved into a visual builder that allows developers to customize animations, preview their behavior, and generate the CSS needed for implementation.

## Features

- Library of reusable animation presets
- Live animation preview
- Custom animation controls
- Timing and advanced configuration
- Support for multiple elements
- Animation search and filtering
- Custom animation creation
- CSS and required HTML generation
- Project import and export
- AEM-ready animation output

## Tech Stack

- React
- Vite
- Sass
- Vanilla CSS for generated animations

## Getting Started

Node.js 22 is recommended.

Clone the repository:

    git clone https://github.com/alejandro-lopez561/animations-builder.git

Navigate to the project:

    cd animations-builder

Install dependencies:

    npm ci

Start the development server:

    npm run dev

### Available Commands

Run the development server:

    npm run dev

Run linting:

    npm run lint

Run tests:

    npm test

Create a production build:

    npm run build

Preview the production build:

    npm run preview

## AEM Usage

Animation Builder is designed to help create reusable animations for existing AEM components.

The Builder itself uses React, but the generated animations are exported as standard CSS and do not require the Builder application at runtime.

For scroll-based animations, the generated classes work with the existing `.inView` activation pattern used in AEM.

Depending on the animation, the Builder can also generate the HTML structure required for effects such as SVG drawing, segmented text, bars, gradients, or sequences.

Generated animations should always be validated in the target AEM environment before production use.

## Documentation

More detailed information about the Builder, animation controls, presets, and usage is available in the **Documentation** section of the application.
