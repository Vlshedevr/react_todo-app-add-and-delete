import { FilterBy } from '../types/Filter';
import cn from 'classnames';

type Props = {
  hasCompleteTodosId: number[];
  activeTodosCount: number;
  selectFilter: FilterBy;
  onFilter: (value: FilterBy) => void;
  deleteAllCompleteTodos: () => void;
};

export const TodoFilter = ({
  hasCompleteTodosId,
  activeTodosCount,
  selectFilter,
  onFilter,
  deleteAllCompleteTodos,
}: Props) => {
  const allFilterArr = Object.values(FilterBy);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {activeTodosCount} items left
      </span>

      {/* Active link should have the 'selected' class */}
      <nav className="filter" data-cy="Filter">
        {allFilterArr.map(filterName => (
          <a
            key={filterName}
            href={`#/${filterName}`}
            className={cn('filter__link', {
              selected: selectFilter === filterName,
            })}
            data-cy={`FilterLink${filterName}`}
            onClick={() => onFilter(filterName)}
          >
            {filterName}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={hasCompleteTodosId.length === 0}
        onClick={deleteAllCompleteTodos}
      >
        Clear completed
      </button>
    </footer>
  );
};
