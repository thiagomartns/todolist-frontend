import { todoKeys } from "@/lib/query-keys";
import { CreateTaskSchemaType } from "@/schemas";
import { createTask } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  onReset?: () => void;
}

export const useCreateTask = ({ onReset }: Props) => {
  const toastId = "create-task";

  const queryClient = useQueryClient();

  const { mutate: mutateTodos } = useMutation({
    mutationFn: async (data: CreateTaskSchemaType) => {
      return await createTask(data);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: todoKeys.all });
      toast.loading("Adding task...", { id: toastId });
    },
    onSuccess: () => {
      onReset?.();
      queryClient.invalidateQueries({ queryKey: todoKeys.all });
      toast.success("Task added successfully!", { id: toastId });
    },
    onError: (err) => {
      console.log("Error adding todo:", err);
      toast.error("Failed to add task. Please try again.", { id: toastId });
    },
  });

  return { mutateTodos };
};
