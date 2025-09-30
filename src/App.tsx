import { useQuery } from "@tanstack/react-query";
import { TaskCreateForm } from "./components/task-create-form";
import { TaskEdit } from "./components/tasks-edit";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Spinner } from "./components/ui/shadcn-io/spinner";
import { ITodo } from "./models";
import { getTodos } from "./services";

function App() {
  const { data: todosData, isPending } = useQuery<ITodo[]>({
    queryKey: ["todos"],
    queryFn: getTodos,
    placeholderData: [],
    refetchOnWindowFocus: false,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg h-full">
        <CardHeader>
          <CardTitle className="text-2xl">Task Manager</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <TaskCreateForm />
          {isPending ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {todosData?.map((todo) => (
                <TaskEdit todo={todo} key={todo._id} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
