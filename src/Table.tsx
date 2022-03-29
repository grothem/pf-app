import { Column, useSortBy, useTable } from "react-table";
import { Item } from "./models";

export interface TableProps {
  columns: Column<Item>[];
  data: Item[];
  onDelete: (item: Item) => void;
  onEdit: (item: Item) => void;
}
export const Table: React.FC<TableProps> = ({
  columns,
  data,
  onEdit,
  onDelete,
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data,
      },
      useSortBy
    );

  return (
    <div className="mt-4 flex flex-col">
      <div className="-my-2 overflow-x-auto -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table
              className="min-w-full divide-y divide-gray-200"
              {...getTableProps()}
            >
              <thead className="bg-gray-50">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column: any) => (
                      <th
                        scope="col"
                        className="group px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                      >
                        <div className="flex items-center justify-between">
                          {column.render("Header")}
                          {/* Add a sort direction indicator */}
                          <span>
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <SortDownIcon className="w-4 h-4 text-gray-400" />
                              ) : (
                                <SortUpIcon className="w-4 h-4 text-gray-400" />
                              )
                            ) : (
                              <SortIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                    <th></th>
                    <th></th>
                  </tr>
                ))}
              </thead>
              <tbody
                className="bg-white divide-y divide-gray-200"
                {...getTableBodyProps()}
              >
                {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell: any) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            className="px-6 py-4 whitespace-nowrap"
                            role="cell"
                          >
                            {cell.column.Cell.name === "defaultRenderer" ? (
                              <div className="text-sm text-gray-500">
                                {cell.render("Cell")}
                              </div>
                            ) : (
                              cell.render("Cell")
                            )}
                          </td>
                        );
                      })}
                      <button
                        className="m-2 px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm"
                        onClick={(e) => onEdit(row.original)}
                      >
                        Edit
                      </button>
                      <button
                        className="m-2 px-4 py-2 font-semibold text-sm bg-red-500 text-white rounded-full shadow-sm"
                        onClick={(e) => onDelete(row.original)}
                      >
                        Delete
                      </button>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const SortIcon: React.FC<{ className: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path>
    </svg>
  );
};

const SortUpIcon: React.FC<{ className: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
    </svg>
  );
};

const SortDownIcon: React.FC<{ className: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
    </svg>
  );
};
