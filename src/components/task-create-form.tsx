import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useCreateTask } from "@/hooks/use-create-task";
import { createTaskSchema, CreateTaskSchemaType } from "@/schemas";

export const TaskCreateForm = () => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<CreateTaskSchemaType>({
    defaultValues: {
      text: "",
    },
    resolver: zodResolver(createTaskSchema),
  });

  const { mutateTodos } = useCreateTask({ onReset: reset });

  const handleSubmitTodo = async (data: CreateTaskSchemaType) => {
    await mutateTodos(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleSubmitTodo)}
      className="flex items-center gap-2 shadow-sm border border-gray-200 p-2 rounded-lg"
    >
      <Input
        type="text"
        placeholder="What needs to be done?"
        required
        {...register("text")}
      />
      <Button type="submit" disabled={!isDirty}>
        Add Task
      </Button>
    </form>
  );
};
