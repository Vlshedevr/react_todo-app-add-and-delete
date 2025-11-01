/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TodosBar } from './components/TodosBar';
import { TodoFilter } from './components/TodoFilter';
import { ErrorMessage } from './components/ErrorMessage';
import { Todo } from './types/Todo';
import { deleteTodo, getTodos, postTodo, USER_ID } from './api/todos';
import { FilterBy } from './types/Filter';
import { AddBar } from './components/AddBar';
import { TypeErrMes } from './types/Error';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterBy>(FilterBy.All);
  const [errorMessage, setErrorMessage] = useState<TypeErrMes | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<Set<number | number[]>>(new Set());

  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const hasCompleteTodosId = todos
    .filter(todo => todo.completed)
    .map(comleteTodo => comleteTodo.id);

  const createTempTodo = (title: string) => {
    const TempTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: title,
      completed: false,
    };

    setTempTodo(TempTodo);
  };

  const addNewTodo = (newTodo: Todo) => {
    setTodos(currTodos => [...currTodos, newTodo]);
  };

  const onDeleteErrorMessage = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const filtertTodos = useMemo<Todo[]>(() => {
    switch (filter) {
      case FilterBy.All:
        return todos;
      case FilterBy.Active:
        return todos.filter(todo => !todo.completed);
      case FilterBy.Completed:
        return todos.filter(todo => todo.completed);
    }
  }, [filter, todos]);

  const createTodo = (title: string, clearTitle: () => void) => {
    setErrorMessage(null);
    const parseTitle = title.trim();

    if (parseTitle) {
      setIsCreating(true);
      createTempTodo(parseTitle);
      const newTodo = { userId: USER_ID, title: parseTitle, completed: false };

      postTodo(newTodo)
        .then(addTodo => {
          clearTitle();
          setTempTodo(null);
          addNewTodo(addTodo);
        })
        .catch(() => {
          setErrorMessage(TypeErrMes.UnableLoad);
          setTempTodo(null);
        })
        .finally(() => setIsCreating(false));
    } else {
      setErrorMessage(TypeErrMes.TitleNotBeEmpty);
    }
  };

  const delTodo = (todoId: number) => {
    setErrorMessage(null);
    setIsDeleted(currSet => {
      const newSet = new Set(currSet);

      newSet.add(todoId);

      return newSet;
    });

    return deleteTodo(todoId)
      .then(() => {
        setTodos(curr => curr.filter(oldTodo => oldTodo.id !== todoId));
      })
      .catch(() => {
        setErrorMessage(TypeErrMes.UnableDelete);
      })
      .finally(() => {
        setIsDeleted(currSet => {
          const newSet = new Set(currSet);

          newSet.delete(todoId);

          return newSet;
        });
      });
  };

  const deleteAllCompleteTodos = () => {
    if (hasCompleteTodosId.length === 0) {
      return;
    }

    const idToDelete = [...hasCompleteTodosId];

    setIsDeleted(curr => {
      const newSet = new Set(curr);

      idToDelete.forEach(id => newSet.add(id));

      return newSet;
    });

    const successId: number[] = [];
    const failedId: number[] = [];

    const deleteTodos = idToDelete.map(todoId =>
      delTodo(todoId)
        .then(() => successId.push(todoId))
        .catch(() => failedId.push(todoId)),
    );

    Promise.all(deleteTodos).finally(() => {
      if (successId.length > 0) {
        setTodos(curr =>
          curr.filter(oldTodo => !successId.includes(oldTodo.id)),
        );
      }

      if (failedId.length > 0) {
        setErrorMessage(TypeErrMes.UnableDelete);
      }

      setIsDeleted(curr => {
        const newSet = new Set(curr);

        idToDelete.forEach(id => newSet.delete(id));

        return newSet;
      });
    });
  };

  useEffect(() => {
    setErrorMessage(null);

    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage(TypeErrMes.UnableLoad));
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <AddBar
          activeTodosCount={activeTodosCount}
          createTodo={createTodo}
          isCreating={isCreating}
        />

        <TodosBar
          todos={filtertTodos}
          tempTodo={tempTodo}
          delTodo={delTodo}
          isDeleted={isDeleted}
        />

        {todos.length !== 0 && (
          <TodoFilter
            hasCompleteTodosId={hasCompleteTodosId}
            activeTodosCount={activeTodosCount}
            selectFilter={filter}
            onFilter={setFilter}
            deleteAllCompleteTodos={deleteAllCompleteTodos}
          />
        )}
      </div>

      <ErrorMessage
        errorMessage={errorMessage}
        onDeleteErrorMessage={onDeleteErrorMessage}
      />
    </div>
  );
};
