import { useState, useEffect, useCallback } from "react";
import { useTaskDependencies } from "@/app/context/TaskDependenciesContext";
import { Sprint } from "@/domain/entities/Sprint";
import { CreateSprintDTO } from "@/application/implement/CreateSprint";

export function useSprints() {
  const { getSprints, createSprint } = useTaskDependencies();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSprints = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSprints.execute();
      setSprints(data);
    } catch (error) {
      console.error("Failed to load sprints", error);
    } finally {
      setIsLoading(false);
    }
  }, [getSprints]);

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  const handleCreateSprint = useCallback(
    async (input: CreateSprintDTO) => {
      try {
        const newSprint = await createSprint.execute(input);
        setSprints((prev) => [...prev, newSprint]);
        return newSprint;
      } catch (error) {
        console.error("Failed to create sprint", error);
        throw error;
      }
    },
    [createSprint],
  );

  return {
    sprints,
    isLoading,
    createSprint: handleCreateSprint,
    refresh: loadSprints,
  };
}
