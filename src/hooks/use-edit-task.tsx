import { todoKeys } from "@/lib/query-keys";
import { toastIds } from "@/lib/toast-ids";
import { ICompleteTask, ITodo } from "@/models";
import { EditTaskSchemaType } from "@/schemas";
import { completeTask, editTask, removeTask } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  todo: ITodo;
  form: UseFormReturn<EditTaskSchemaType>;
}

export const useEditTask = ({ todo, form }: Props) => {
  const queryClient = useQueryClient();

  const { mutate: handleEditTask } = useMutation({
    mutationFn: async (values: EditTaskSchemaType) =>
      editTask({ _id: todo._id, text: values.text }),

    onMutate: async (values) => {
      const toastId = toastIds.edit(todo._id);
      toast.loading("Editing task...", { id: toastId });
      await queryClient.cancelQueries({ queryKey: todoKeys.all });

      const previous = queryClient.getQueryData<ITodo[]>(todoKeys.all) ?? [];
      queryClient.setQueryData<ITodo[]>(todoKeys.all, (curr = []) =>
        curr.map((t) => (t._id === todo._id ? { ...t, text: values.text } : t))
      );

      return { previous, values, toastId };
    },

    onSuccess: (_data, values, ctx) => {
      form.reset({ text: values.text, completed: form.getValues("completed") });
      toast.success("Task edited successfully!", {
        id: ctx?.toastId,
      });
    },

    onError: (_err, _values, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(todoKeys.all, ctx.previous);
      toast.error("Failed to edit task. Please try again.", {
        id: ctx?.toastId,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });

  const { mutate: mutateCompleteTodo } = useMutation({
    mutationFn: async (data: ICompleteTask) => completeTask(data),

    onMutate: async (vars) => {
      const toastId = toastIds.complete(todo._id);
      toast.loading(
        `${vars.completed ? "Completing" : "Uncompleting"} task...`,
        { id: toastId }
      );
      await queryClient.cancelQueries({ queryKey: todoKeys.all });

      const previousTodos = queryClient.getQueryData<ITodo[]>(todoKeys.all);

      queryClient.setQueryData<ITodo[]>(todoKeys.all, (curr) =>
        curr?.map((t) =>
          t._id === todo._id ? { ...t, completed: !t.completed } : t
        )
      );

      return { previousTodos, toastId };
    },
    onSuccess: (_, vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      toast.success(
        `${
          vars.completed
            ? "Task completed successfully!"
            : "Task uncompleted successfully!"
        }`,
        { id: ctx?.toastId }
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
          id: ctx?.toastId,
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
      const toastId = toastIds.remove(todo._id);
      await queryClient.cancelQueries({ queryKey: todoKeys.all });
      toast.loading("Removing task...", { id: toastId });
      return { toastId };
    },
    onSuccess: (_data, _vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      toast.success("Task removed successfully!", {
        id: ctx?.toastId,
      });
    },
    onError: (err, _vars, ctx) => {
      console.log("Error adding todo:", err);
      toast.error("Failed to remove task. Please try again.", {
        id: ctx?.toastId,
      });
    },
  });

  return { handleEditTask, mutateCompleteTodo, deleteTodoMutate };
};
