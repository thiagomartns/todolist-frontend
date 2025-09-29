export interface ITodo {
  _id: string;
  text: string;
  completed: boolean;
}

export interface IEditTask extends Partial<ITodo> {}

export interface ICreateTask extends Omit<ITodo, "_id" | "completed"> {}

export interface ICompleteTask extends Partial<ITodo> {}
