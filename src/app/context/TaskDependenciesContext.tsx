import { createContext, useContext, useMemo } from "react";
import { CreateTask } from "../../application/implement/CreateTask";
import { UpdateTask } from "../../application/implement/UpdateTask";
import { DeleteTask } from "../../application/implement/DeleteTask";
import { GetTasks } from "../../application/implement/GetTasks";
import { CalculateProgress } from "../../application/implement/CalculateProgress";
import { AddComment } from "../../application/implement/AddComment";
import { GetSprints } from "../../application/implement/GetSprints";
import { CreateSprint } from "../../application/implement/CreateSprint";
import { LocalStorageTaskRepository } from "../../infrastructure/repositories/LocalStorageTaskRepository";
import { LocalStorageSprintRepository } from "../../infrastructure/repositories/LocalStorageSprintRepository";

import { GetTaskStatistics } from "../../application/implement/GetTaskStatistics";

interface TaskDependencies {
  createTask: CreateTask;
  updateTask: UpdateTask;
  deleteTask: DeleteTask;
  getTasks: GetTasks;
  calculateProgress: CalculateProgress;
  addComment: AddComment;
  getSprints: GetSprints;
  createSprint: CreateSprint;
  getTaskStatistics: GetTaskStatistics;
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
    const sprintRepository = new LocalStorageSprintRepository();

    return {
      createTask: new CreateTask(taskRepository),
      updateTask: new UpdateTask(taskRepository),
      deleteTask: new DeleteTask(taskRepository),
      getTasks: new GetTasks(taskRepository),
      calculateProgress: new CalculateProgress(),
      addComment: new AddComment(taskRepository),
      getSprints: new GetSprints(sprintRepository),
      createSprint: new CreateSprint(sprintRepository),
      getTaskStatistics: new GetTaskStatistics(taskRepository),
    };
  }, []);

  return <TaskDependenciesContext.Provider value={dependencies}>{children}</TaskDependenciesContext.Provider>;
}
