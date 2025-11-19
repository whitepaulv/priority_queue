# PriorityForge System Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        User[👤 User]
        Browser[🌐 Web Browser]
    end

    subgraph "Frontend - React (Vite)"
        UI[React Components]
        State[State Management]
        API_Client[API Client<br/>Axios/Fetch]
    end

    subgraph "Backend - FastAPI"
        subgraph "API Layer"
            Routes_Task[📝 Task CRUD Routes<br/>GET/POST/PUT/DELETE /api/tasks]
            Routes_Analytics[📊 Analytics Routes<br/>GET /api/analytics]
            Routes_Recommend[🤖 Recommendation Routes<br/>POST /api/recommend]
            Routes_Visualize[📈 Visualization Routes<br/>GET /api/visualize/pq]
        end
        
        subgraph "Service Layer"
            TaskService[Task Service<br/>Business Logic]
            AnalyticsService[Analytics Service<br/>Data Analysis]
            RecommendService[Recommendation Service<br/>ML Recommendations]
            VisualizeService[Visualization Service<br/>PQ State Processing]
        end

        subgraph "Priority Queue Engine"
            PQEngine[PriorityQueueEngine<br/>Core Engine]
            PQAlgorithms[Priority Algorithms<br/>Default, Eisenhower, TimeDecay]
        end
    end

    subgraph "Data Layer"
        SQLite[(SQLite Database)]
        SQLAlchemy[SQLAlchemy ORM]
        Models[Data Models<br/>Task, Base]
    end

    subgraph "Future Extensions"
        ML_Module[ML Module<br/>Future]
        Analytics_DB[Analytics Database<br/>Future]
    end

    %% User to Frontend
    User --> Browser
    Browser --> UI

    %% Frontend Internal Flow
    UI --> State
    State --> API_Client

    %% Frontend to Backend API Routes
    API_Client -->|HTTP Requests| Routes_Task
    API_Client -->|HTTP Requests| Routes_Analytics
    API_Client -->|HTTP Requests| Routes_Recommend
    API_Client -->|HTTP Requests| Routes_Visualize

    %% API Routes to Services
    Routes_Task --> TaskService
    Routes_Analytics --> AnalyticsService
    Routes_Recommend --> RecommendService
    Routes_Visualize --> VisualizeService

    %% Services to Priority Queue Engine
    TaskService --> PQEngine
    AnalyticsService --> PQEngine
    RecommendService --> PQEngine
    VisualizeService --> PQEngine
    PQEngine --> PQAlgorithms

    %% Services to Database
    TaskService --> SQLAlchemy
    AnalyticsService --> SQLAlchemy
    RecommendService --> SQLAlchemy
    VisualizeService --> SQLAlchemy
    SQLAlchemy --> Models
    Models --> SQLite

    %% Priority Queue Engine to Database (for reading/writing task state)
    PQEngine <--> SQLAlchemy

    %% Future Extensions
    RecommendService -.->|Future| ML_Module
    AnalyticsService -.->|Future| Analytics_DB
    ML_Module -.->|Future| Analytics_DB

    %% Response Flow (dashed lines)
    SQLite -.->|Query Results| SQLAlchemy
    SQLAlchemy -.->|Models| TaskService
    PQEngine -.->|Priority Scores| TaskService
    TaskService -.->|JSON Response| Routes_Task
    Routes_Task -.->|HTTP Response| API_Client
    API_Client -.->|Update State| State
    State -.->|Re-render| UI
    UI -.->|Display| Browser

    %% Styling
    classDef frontend fill:#61dafb,stroke:#20232a,stroke-width:2px,color:#000
    classDef backend fill:#009485,stroke:#fff,stroke-width:2px,color:#fff
    classDef database fill:#003b57,stroke:#fff,stroke-width:2px,color:#fff
    classDef engine fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
    classDef future fill:#ccc,stroke:#666,stroke-width:2px,color:#000,stroke-dasharray: 5 5

    class UI,State,API_Client,Browser frontend
    class Routes_Task,Routes_Analytics,Routes_Recommend,Routes_Visualize,TaskService,AnalyticsService,RecommendService,VisualizeService backend
    class SQLite,SQLAlchemy,Models database
    class PQEngine,PQAlgorithms engine
    class ML_Module,Analytics_DB future
```

## Detailed Component Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Frontend
    participant API as FastAPI Routes
    participant Service as Service Layer
    participant PQEngine as Priority Queue Engine
    participant DB as SQLite Database

    Note over User,DB: Task CRUD Operations Flow
    
    User->>Frontend: Interact with UI
    Frontend->>API: POST /api/tasks (Create Task)
    API->>Service: TaskService.create_task()
    Service->>PQEngine: Calculate Priority
    PQEngine->>PQEngine: Apply Algorithm
    PQEngine-->>Service: Priority Score
    Service->>DB: INSERT Task
    DB-->>Service: Task Created
    Service-->>API: Task Response
    API-->>Frontend: JSON Response
    Frontend-->>User: Display Updated Task

    Note over User,DB: Priority Queue Visualization Flow
    
    User->>Frontend: Request PQ Visualization
    Frontend->>API: GET /api/visualize/pq
    API->>Service: VisualizeService.get_queue_state()
    Service->>PQEngine: Get Queue State
    PQEngine->>DB: Query All Tasks
    DB-->>PQEngine: Task List
    PQEngine->>PQEngine: Sort by Priority
    PQEngine-->>Service: Queue State + Visualization Data
    Service-->>API: Visualization JSON
    API-->>Frontend: Response
    Frontend-->>User: Render PQ Visualization

    Note over User,DB: Analytics Flow
    
    User->>Frontend: Request Analytics
    Frontend->>API: GET /api/analytics
    API->>Service: AnalyticsService.get_analytics()
    Service->>DB: Query Task History
    DB-->>Service: Historical Data
    Service->>Service: Calculate Metrics
    Service->>PQEngine: Get Current Queue State
    PQEngine-->>Service: Current Priorities
    Service-->>API: Analytics Data
    API-->>Frontend: JSON Response
    Frontend-->>User: Display Analytics Dashboard
```

## Priority Queue Engine Internal Architecture

```mermaid
graph LR
    subgraph "Priority Queue Engine"
        Engine[PriorityQueueEngine<br/>Core Engine]
        
        subgraph "Algorithms"
            Default[Default Algorithm<br/>Urgency + Importance]
            Eisenhower[Eisenhower Matrix<br/>4 Quadrants]
            TimeDecay[Time Decay<br/>Due Date Based]
            Future_ML[ML Algorithm<br/>Future]
        end
        
        Queue[Internal Queue<br/>Sorted by Priority]
    end

    Task[Task Input] --> Engine
    Engine --> Default
    Engine --> Eisenhower
    Engine --> TimeDecay
    Engine -.-> Future_ML
    
    Default -->|Priority Score| Queue
    Eisenhower -->|Priority Score| Queue
    TimeDecay -->|Priority Score| Queue
    Future_ML -.->|Priority Score| Queue
    
    Queue -->|Sorted Tasks| Output[Prioritized Output]

    classDef current fill:#4ecdc4,stroke:#fff,stroke-width:2px,color:#000
    classDef future fill:#ccc,stroke:#666,stroke-width:2px,color:#000,stroke-dasharray: 5 5
    class Engine,Queue current
    class Default,Eisenhower,TimeDecay current
    class Future_ML future
```

## Data Flow Diagram

```mermaid
flowchart TD
    Start([User Action]) --> Frontend{React Frontend}
    
    Frontend -->|Create/Update Task| TaskCRUD[Task CRUD Endpoint]
    Frontend -->|View Analytics| AnalyticsEP[Analytics Endpoint]
    Frontend -->|Get Recommendations| RecommendEP[Recommendation Endpoint]
    Frontend -->|Visualize Queue| VisualizeEP[Visualization Endpoint]
    
    TaskCRUD --> TaskSvc[Task Service]
    AnalyticsEP --> AnalyticsSvc[Analytics Service]
    RecommendEP --> RecommendSvc[Recommendation Service]
    VisualizeEP --> VisualizeSvc[Visualization Service]
    
    TaskSvc --> PQCalc[Calculate Priority]
    AnalyticsSvc --> PQRead[Read Queue State]
    RecommendSvc --> PQAnalyze[Analyze Priorities]
    VisualizeSvc --> PQState[Get Queue State]
    
    PQCalc --> PQAlgo[Priority Algorithm]
    PQRead --> PQAlgo
    PQAnalyze --> PQAlgo
    PQState --> PQAlgo
    
    PQAlgo --> DB[(SQLite Database)]
    TaskSvc --> DB
    AnalyticsSvc --> DB
    
    DB -->|Task Data| Response[Response Data]
    PQAlgo -->|Priority Scores| Response
    
    Response -->|JSON| Frontend
    Frontend -->|UI Update| End([User Sees Result])

    classDef api fill:#009485,stroke:#fff,stroke-width:2px,color:#fff
    classDef service fill:#4ecdc4,stroke:#fff,stroke-width:2px,color:#000
    classDef pq fill:#ff6b6b,stroke:#fff,stroke-width:2px,color:#fff
    classDef db fill:#003b57,stroke:#fff,stroke-width:2px,color:#fff
    
    class TaskCRUD,AnalyticsEP,RecommendEP,VisualizeEP api
    class TaskSvc,AnalyticsSvc,RecommendSvc,VisualizeSvc service
    class PQCalc,PQRead,PQAnalyze,PQState,PQAlgo pq
    class DB db
```

## Technology Stack Diagram

```mermaid
graph TB
    subgraph "Frontend Stack"
        React[React 18]
        Vite[Vite]
        CSS[CSS3]
    end

    subgraph "Backend Stack"
        FastAPI[FastAPI]
        Python[Python 3.9+]
        Pydantic[Pydantic]
    end

    subgraph "Data Stack"
        SQLite[SQLite]
        SQLAlchemy[SQLAlchemy ORM]
    end

    subgraph "Priority Engine"
        CustomPQ[Custom Python Classes]
        Algorithms[Priority Algorithms]
    end

    subgraph "Future Stack"
        ML[ML Libraries<br/>scikit-learn, TensorFlow]
        Analytics[Analytics Tools<br/>Pandas, NumPy]
    end

    React --> Vite
    FastAPI --> Python
    FastAPI --> Pydantic
    SQLAlchemy --> SQLite
    CustomPQ --> Algorithms
    Algorithms -.-> ML
    ML -.-> Analytics

    classDef current fill:#4ecdc4,stroke:#fff,stroke-width:2px,color:#000
    classDef future fill:#ccc,stroke:#666,stroke-width:2px,color:#000,stroke-dasharray: 5 5
    
    class React,Vite,CSS,FastAPI,Python,Pydantic,SQLite,SQLAlchemy,CustomPQ,Algorithms current
    class ML,Analytics future
```

