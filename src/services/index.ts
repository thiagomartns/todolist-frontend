import { ICompleteTask, ICreateTask, IEditTask } from "@/models";
import { CreateTaskSchemaType } from "@/schemas";
import axios from "axios";

export const createTask = async (data: ICreateTask) => {
  const response = await axios.post("/api/todos", { text: data.text });
  return response.data;
};

export const editTask = async (data: IEditTask) => {
  await axios.patch(`/api/todos/${data._id}`, { text: data.text });
};

export const removeTask = async (id: string) => {
  await axios.delete(`/api/todos/${id}`);
};

export const completeTask = async (data: ICompleteTask) => {
  await axios.patch(`/api/todos/${data._id}`, { completed: data.completed });
};
