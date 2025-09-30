import { FormValues } from "@/components/tasks-edit";
import { todoKeys } from "@/lib/query-keys";
import { ICompleteTask, IEditTask, ITodo } from "@/models";
import { completeTask, editTask, removeTask } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    mutationFn: async (values: IEditTask) =>
      editTask({ _id: todo._id, text: values.text }),

    onMutate: async (values) => {
      toast.loading("Editing task...", { id: editTaskID });
      await queryClient.cancelQueries({ queryKey: todoKeys.all });

      const previous = queryClient.getQueryData<ITodo[]>(todoKeys.all) ?? [];
      queryClient.setQueryData<ITodo[]>(todoKeys.all, (curr = []) =>
        curr.map((t) => (t._id === todo._id ? { ...t, text: values.text } : t))
      );

      return { previous, values };
    },

    onSuccess: (_data, values) => {
      form.reset({ text: values.text, completed: form.getValues("completed") });
      toast.success("Task edited successfully!", { id: editTaskID });
    },

    onError: (_err, _values, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(todoKeys.all, ctx.previous);
      toast.error("Failed to edit task. Please try again.", { id: editTaskID });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });

  const { mutate: mutateCompleteTodo } = useMutation({
    mutationFn: async (data: ICompleteTask) => completeTask(data),

    onMutate: async (vars) => {
      toast.loading(
        `${vars.completed ? "Completing" : "Uncompleting"} task...`,
        { id: completeTaskID }
      );
      await queryClient.cancelQueries({ queryKey: todoKeys.all });

      const previousTodos = queryClient.getQueryData<ITodo[]>(todoKeys.all);

      queryClient.setQueryData<ITodo[]>(todoKeys.all, (curr) =>
        curr?.map((t) =>
          t._id === todo._id ? { ...t, completed: !t.completed } : t
        )
      );

      return { previousTodos };
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
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
        queryClient.setQueryData(todoKeys.all, ctx.previousTodos);
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
      await queryClient.cancelQueries({ queryKey: todoKeys.all });
      toast.loading("Removing task...", { id: removeTaskID });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
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
