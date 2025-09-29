import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Trash } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Checkbox } from "./ui/checkbox";
import { useEditTask } from "@/hooks/use-edit-task";
import { ITodo } from "@/models";

interface TaskEditProps {
  todo: ITodo;
}

const schema = z.object({
  text: z.string().min(2).max(100),
  completed: z.boolean(),
});

export type FormValues = z.infer<typeof schema>;

export const TaskEdit = ({ todo }: TaskEditProps) => {
  const form = useForm<FormValues>({
    defaultValues: {
      text: todo.text,
      completed: todo.completed,
    },
  });

  const { handleEditTask, mutateCompleteTodo, deleteTodoMutate } = useEditTask({
    todo,
    form,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => handleEditTask(values))}>
        <div className="flex items-center gap-x-3">
          <FormField
            control={form.control}
            name="completed"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => {
                      const checked = !!v;
                      field.onChange(checked);
                      mutateCompleteTodo({ _id: todo._id, completed: checked });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Input type="text" {...form.register("text")} />
          <div className="flex gap-x-2">
            <Button
              className="hover:cursor-pointer"
              type="button"
              size="icon"
              onClick={() => deleteTodoMutate(todo._id)}
            >
              <Trash />
            </Button>
            <Button
              className="hover:cursor-pointer disabled:cursor-not-allowed"
              size="icon"
              disabled={!form.formState.dirtyFields.text}
              type="submit"
            >
              <Send />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
