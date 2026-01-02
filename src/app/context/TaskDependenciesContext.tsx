import { createContext, useContext, useMemo } from "react";
import { CreateTask } from "../../application/implement/CreateTask";
import { UpdateTask } from "../../application/implement/UpdateTask";
import { DeleteTask } from "../../application/implement/DeleteTask";
import { GetTasks } from "../../application/implement/GetTasks";
import { CalculateProgress } from "../../application/implement/CalculateProgress";
import { LocalStorageTaskRepository } from "../../infrastructure/repositories/LocalStorageTaskRepository";

interface TaskDependencies {
  createTask: CreateTask;
  updateTask: UpdateTask;
  deleteTask: DeleteTask;
  getTasks: GetTasks;
  calculateProgress: CalculateProgress;
}

const TaskDependenciesContext = createContext<TaskDependencies | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useTaskDependencies() {
  const context = useContext(TaskDependenciesContext);
  if (!context) {
    throw new Error("useTaskDependencies must be used within a TaskDependenciesProvider");
  }
  return context;
}

export function TaskDependenciesProvider({ children }: { children: React.ReactNode }) {
  const dependencies = useMemo(() => {
    // Composition Root: Wiring everything together
    const taskRepository = new LocalStorageTaskRepository();

    return {
      createTask: new CreateTask(taskRepository),
      updateTask: new UpdateTask(taskRepository),
      deleteTask: new DeleteTask(taskRepository),
      getTasks: new GetTasks(taskRepository),
      calculateProgress: new CalculateProgress(),
    };
  }, []);

  return <TaskDependenciesContext.Provider value={dependencies}>{children}</TaskDependenciesContext.Provider>;
}
