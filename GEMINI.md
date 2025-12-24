# Project Overview

This project is a 4-dimensional navigation game written in vanilla JavaScript. The game renders a 2D slice of a 4D space onto an HTML canvas. The player can move in four dimensions (x, y, z, w) and inspect points in the space.

## Building and Running

### Prerequisites

- [Node.js and npm](https://nodejs.org/en/)
- [Python 3](https://www.python.org/downloads/)

### Building the Project

To build the project, run the following command. This will bundle the JavaScript files and copy the `index.html` file to the `dist` directory.

```bash
npm install
npm run build
```

### Running the Project

To run the project, you need to start a web server. The `package.json` file provides a `start` script that uses Python's built-in HTTP server.

```bash
npm start
```

This will start a web server on port 8000. You can then access the game by navigating to `http://localhost:8000/src/index.html` in your web browser.

## Development Conventions

The project uses ES6 modules. The code is organized into several files in the `src` directory:

- `index.js`: The main entry point of the application. It creates the game instance and runs the game loop.
- `game.js`: Contains the main game logic, including player movement, game state management, and event handling.
- `map-builder.js`: Responsible for creating the 4D game map.
- `screen-painter.js`: Renders the game state onto the canvas.
- `input-controller.js`: Handles user input from the keyboard and mouse.
- `event-bus.js`: A simple event bus for communication between different parts of the application.
- `helpers.js`: Contains helper functions.
- `view-config.js`: Configuration for the view.
- `index.html`: The main HTML file for the game.
