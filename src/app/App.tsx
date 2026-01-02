import { TaskBoardPage } from "@/pages/TaskBoardPage";

function App() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            {/* In a real app, Router would go here */}
            <main className="container mx-auto py-8 px-4 h-screen">
                <TaskBoardPage />
            </main>
        </div>
    )
}

export default App
