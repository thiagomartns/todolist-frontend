import { FormValues } from "@/components/tasks-edit";
import { ICompleteTask, ITodo } from "@/models";
import { completeTask, editTask, removeTask } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  todo: ITodo;
  form: UseFormReturn<FormValues>;
}

export const useEditTask = ({ todo, form }: Props) => {
  const removeTaskID = "remove-task";
  const editTaskID = "edit-task";
  const completeTaskID = "complete-task";

  const queryClient = useQueryClient();

  const { mutate: handleEditTask } = useMutation({
    mutationFn: async (values: FormValues) => editTask(todo),

    onMutate: async (values) => {
      toast.loading("Editing task...", { id: editTaskID });
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previous = queryClient.getQueryData<ITodo[]>(["todos"]) ?? [];

      queryClient.setQueryData<ITodo[]>(["todos"], (curr = []) =>
        curr.map((t) => (t._id === todo._id ? { ...t, text: values.text } : t))
      );

      return { previous, values };
    },

    onSuccess: (_data, values) => {
      form.reset({ text: values.text, completed: form.getValues("completed") });
      toast.success("Task edited successfully!", { id: editTaskID });
    },

    onError: (_err, _values, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["todos"], ctx.previous);
      toast.error("Failed to edit task. Please try again.", { id: editTaskID });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const { mutate: mutateCompleteTodo } = useMutation({
    mutationFn: async (data: ICompleteTask) => completeTask(data),

    onMutate: async (vars) => {
      toast.loading(
        `${vars.completed ? "Completing" : "Uncompleting"} task...`,
        { id: completeTaskID }
      );
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData<ITodo[]>(["todos"]);

      queryClient.setQueryData<ITodo[]>(["todos"], (curr) =>
        curr?.map((t) =>
          t._id === todo._id ? { ...t, completed: !t.completed } : t
        )
      );

      return { previousTodos };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success(
        `${
          vars.completed
            ? "Task completed successfully!"
            : "Task uncompleted successfully!"
        }`,
        { id: completeTaskID }
      );
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previousTodos) {
        queryClient.setQueryData(["todos"], ctx.previousTodos);
      }
      toast.error(
        `Failed to ${
          vars.completed ? "complete" : "uncomplete"
        } task. Please try again.`,
        {
          id: completeTaskID,
        }
      );
      console.log("Error updating todo:", err);
    },
  });

  const { mutate: deleteTodoMutate } = useMutation({
    mutationFn: async (id: string) => {
      await removeTask(id);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      toast.loading("Removing task...", { id: removeTaskID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Task removed successfully!", { id: removeTaskID });
    },
    onError: (err, _vars, _ctx) => {
      console.log("Error adding todo:", err);
      toast.error("Failed to remove task. Please try again.", {
        id: removeTaskID,
      });
    },
  });

  return { handleEditTask, mutateCompleteTodo, deleteTodoMutate };
};
