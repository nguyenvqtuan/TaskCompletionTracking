import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskBoardPage } from "@/pages/TaskBoardPage";
import { TaskDetailPage } from "@/pages/TaskDetailPage";
import { SprintPlanningPage } from "@/pages/SprintPlanningPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TaskDependenciesProvider } from "@/app/context/TaskDependenciesContext";
import { AuthProvider } from "@/app/context/AuthContext";

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <div className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <TaskDependenciesProvider>
            <BrowserRouter>
              <main className="container mx-auto py-8 px-4 h-screen">
                <Routes>
                  <Route path="/" element={<TaskBoardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/task/:id" element={<TaskDetailPage />} />
                  <Route path="/planning" element={<SprintPlanningPage />} />
                </Routes>
              </main>
            </BrowserRouter>
          </TaskDependenciesProvider>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
