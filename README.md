# Phenomenon Board

An interactive graph visualization tool for exploring and mapping complex networks of information, inspired by classic conspiracy boards.

This project is built with React and TypeScript, and it uses the HTML5 Canvas for rendering the graph. The physics simulation is a simple force-directed layout implementation.

## Data-First Architecture

This project has been refactored to be completely data-driven. The entire graph visualization is generated from a single static JSON file, making it easy to populate with large, complex datasets.

-   **Data Source**: The application loads all its data from `/public/data.json`.
-   **Schema**: The structure of this JSON file is defined by the `EventRecord` interface in `src/types.ts`. This schema is designed to be the output of an external research agent.
-   **Extensibility**: To visualize a new dataset, you only need to replace the `data.json` file. No code changes are required, assuming the new data conforms to the `EventRecord` schema.

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
│   ├── data.json  <-- The primary data source for the graph
│   └── ...
├── src/
│   ├── components/
│   │   ├── ...
│   │   └── NodeDetailPanel.tsx
│   ├── hooks/
│   │   ├── ...
│   │   └── useGraphData.ts
│   ├── services/
│   │   └── GraphService.ts
│   ├── theme.ts
│   └── types.ts
├── app.tsx
└── ...
```

-   **`public/data.json`**: A static JSON file containing an array of `EventRecord` objects. This is the sole source of truth for the application's content.
-   **`src/components`**: React components responsible for rendering the UI. `NodeDetailPanel` has been updated to render the rich `EventRecord` data.
-   **`src/hooks`**: Custom React hooks that encapsulate the application logic.
-   **`src/services`**: Services responsible for fetching and parsing the data. The `StaticGraphService` implementation loads the `/public/data.json` file.
-   **`src/theme.ts`**: Style constants for the graph nodes and links.
-   **`src/types.ts`**: TypeScript type definitions, including the core `EventRecord` schema.
-   **`app.tsx`**: The composition root of the application.

## SOLID Principles

The refactoring of this project was guided by the SOLID principles of object-oriented design.

-   **S - Single Responsibility Principle**: Each component, hook, and service has a single, well-defined responsibility. For example, `usePhysicsSimulation` only calculates the physics of the graph, while `useGraphData` is only responsible for loading and managing the data state.
-   **O - Open/Closed Principle**: The rendering of new node types can be added by modifying the `theme.ts` file, without changing the core rendering logic.
-   **L - Liskov Substitution Principle**: The `Node` interface, which extends the `EventRecord`, is used throughout the application. All visualized entities adhere to this interface, allowing them to be used interchangeably.
-   **I - Interface Segregation Principle**: Components only depend on the props they need. For example, the `NodeDetailPanel` only receives the `selectedNode` and the necessary callbacks, not the entire application state.
-   **D - Dependency Inversion Principle**: High-level modules (the UI components) do not depend on low-level modules (the data-fetching implementation). Instead, they depend on an abstraction (the `GraphService` interface). This was demonstrated perfectly in the recent refactoring: the persistence layer was swapped from `LocalStorageGraphService` to a file-based `StaticGraphService` with **zero changes required in the UI components**. This showcases the power of a loosely-coupled architecture.
