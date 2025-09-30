import { ICompleteTask, ICreateTask, IEditTask, ITodo } from "@/models";
import axios from "axios";

export const getTodos = async (): Promise<ITodo[]> => {
  const response = await axios.get("/api/todos");
  return response.data;
};

export const createTask = async (data: ICreateTask): Promise<ITodo> => {
  const response = await axios.post("/api/todos", { text: data.text });
  return response.data;
};

export const editTask = async (data: IEditTask): Promise<void> => {
  await axios.patch(`/api/todos/${data._id}`, { text: data.text });
};

export const removeTask = async (id: string): Promise<void> => {
  await axios.delete(`/api/todos/${id}`);
};

export const completeTask = async (data: ICompleteTask): Promise<void> => {
  await axios.patch(`/api/todos/${data._id}`, { completed: data.completed });
};
