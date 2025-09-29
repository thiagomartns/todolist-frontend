import z from "zod";

export const createTaskSchema = z.object({
  text: z.string().min(2).max(100),
});

export type CreateTaskSchemaType = z.infer<typeof createTaskSchema>;

const schema = z.object({
  text: z.string().min(2).max(100),
  completed: z.boolean(),
});

export type FormValues = z.infer<typeof schema>;
