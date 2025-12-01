# Phenomenon Board

An interactive graph visualization tool for exploring and mapping complex networks of information, inspired by classic conspiracy boards.

This project is built with React and TypeScript, and it uses the HTML5 Canvas for rendering the graph. The physics simulation is a simple force-directed layout implementation.

## Running Locally

To run this project locally, you will need to have Node.js and npm installed.

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```

## Project Structure

The project is structured following the principles of Separation of Concerns, with a clear distinction between the different layers of the application.

```
/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── AddNodeModal.tsx
│   │   ├── CanvasLayer.tsx
│   │   ├── HUD.tsx
│   │   └── NodeDetailPanel.tsx
│   ├── hooks/
│   │   ├── useCanvasInteraction.ts
│   │   ├── useCanvasRender.ts
│   │   ├── useGraphData.ts
│   │   └── usePhysicsSimulation.ts
│   ├── services/
│   │   └── GraphService.ts
│   ├── theme.ts
│   └── types.ts
├── app.tsx
├── package.json
└── ...
```

-   **`src/components`**: React components responsible for rendering the UI.
-   **`src/hooks`**: Custom React hooks that encapsulate the application logic.
-   **`src/services`**: Services for data persistence (e.g., `LocalStorageGraphService`).
-   **`src/theme.ts`**: Style constants for the graph nodes and links.
-   **`src/types.ts`**: TypeScript type definitions.
-   **`app.tsx`**: The composition root of the application.

## SOLID Principles

The refactoring of this project was guided by the SOLID principles of object-oriented design.

-   **S - Single Responsibility Principle**: Each component, hook, and service has a single, well-defined responsibility. For example, `usePhysicsSimulation` only calculates the physics of the graph, while `AddNodeModal` is only responsible for the form to add a new node.
-   **O - Open/Closed Principle**: The rendering of new node types can be added by modifying the `theme.ts` file, without changing the core rendering logic.
-   **L - Liskov Substitution Principle**: The `Node` interface is used throughout the application, and all node types adhere to this interface, allowing them to be used interchangeably.
-   **I - Interface Segregation Principle**: Components only depend on the props they need. For example, the `NodeDetailPanel` only receives the `selectedNode` and the necessary callbacks, not the entire application state.
-   **D - Dependency Inversion Principle**: High-level modules (the UI) do not depend on low-level modules (LocalStorage). Instead, they depend on abstractions (`GraphService` interface). This allows for easy replacement of the data persistence layer without touching the UI.
