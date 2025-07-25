import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ColumnDef,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { css } from "@emotion/react";

import {
  Button,
  Icon,
  IconButton,
  Icons,
  Text,
  Tooltip,
  TooltipTrigger,
  View,
} from "@phoenix/components";
import { FloatCell, IntCell, TextCell } from "@phoenix/components/table";
import { Separator, Toolbar } from "@phoenix/components/toolbar";
import { FloatingToolbarContainer } from "@phoenix/components/toolbar/FloatingToolbarContainer";

import { IndeterminateCheckboxCell } from "../src/components/table/IndeterminateCheckboxCell";
import { selectableTableCSS } from "../src/components/table/styles";
import { TableEmpty } from "../src/components/table/TableEmpty";

// Mock data types
type Person = {
  id: string;
  name: string;
  age: number;
  email: string;
  salary: number;
  status: "active" | "inactive";
  department: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  rating: number;
};

// Mock data
const mockPeople: Person[] = [
  {
    id: "1",
    name: "John Doe",
    age: 30,
    email: "john.doe@example.com",
    salary: 75000,
    status: "active",
    department: "Engineering",
  },
  {
    id: "2",
    name: "Jane Smith",
    age: 28,
    email: "jane.smith@example.com",
    salary: 82000,
    status: "active",
    department: "Design",
  },
  {
    id: "3",
    name: "Bob Johnson",
    age: 35,
    email: "bob.johnson@example.com",
    salary: 68000,
    status: "inactive",
    department: "Marketing",
  },
  {
    id: "4",
    name: "Alice Williams",
    age: 32,
    email: "alice.williams@example.com",
    salary: 95000,
    status: "active",
    department: "Engineering",
  },
  {
    id: "5",
    name: "Charlie Brown",
    age: 45,
    email: "charlie.brown@example.com",
    salary: 120000,
    status: "active",
    department: "Management",
  },
  {
    id: "6",
    name: "David Kim",
    age: 29,
    email: "david.kim@example.com",
    salary: 70000,
    status: "active",
    department: "Engineering",
  },
  {
    id: "7",
    name: "Emily Clark",
    age: 26,
    email: "emily.clark@example.com",
    salary: 65000,
    status: "inactive",
    department: "Support",
  },
  {
    id: "8",
    name: "Frank Garcia",
    age: 38,
    email: "frank.garcia@example.com",
    salary: 88000,
    status: "active",
    department: "Sales",
  },
  {
    id: "9",
    name: "Grace Lee",
    age: 31,
    email: "grace.lee@example.com",
    salary: 93500,
    status: "active",
    department: "Marketing",
  },
  {
    id: "10",
    name: "Hank Miller",
    age: 42,
    email: "hank.miller@example.com",
    salary: 112000,
    status: "inactive",
    department: "HR",
  },
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Laptop Pro",
    price: 1299.99,
    category: "Electronics",
    inStock: true,
    rating: 4.5,
  },
  {
    id: "2",
    name: "Wireless Mouse",
    price: 29.99,
    category: "Electronics",
    inStock: true,
    rating: 4.2,
  },
  {
    id: "3",
    name: "Office Chair",
    price: 299.99,
    category: "Furniture",
    inStock: false,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Desk Lamp",
    price: 79.99,
    category: "Furniture",
    inStock: true,
    rating: 4.0,
  },
  {
    id: "5",
    name: "Smartphone X",
    price: 999.99,
    category: "Electronics",
    inStock: true,
    rating: 4.6,
  },
  {
    id: "6",
    name: "Noise-Cancelling Headphones",
    price: 199.99,
    category: "Electronics",
    inStock: false,
    rating: 4.4,
  },
  {
    id: "7",
    name: "Gaming Keyboard",
    price: 129.99,
    category: "Electronics",
    inStock: true,
    rating: 4.3,
  },
  {
    id: "8",
    name: "Standing Desk",
    price: 499.99,
    category: "Furniture",
    inStock: true,
    rating: 4.8,
  },
  {
    id: "9",
    name: "LED Monitor",
    price: 249.99,
    category: "Electronics",
    inStock: true,
    rating: 4.5,
  },
];

// Base Table Component
function BaseTable<T>({
  columns,
  data,
  enableResizing = true,
  enableSorting = true,
  onSelectionChange,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  enableResizing?: boolean;
  enableSorting?: boolean;
  onSelectionChange?: (selectedCount: number) => void;
}) {
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable<T>({
    columns,
    data,
    state: {
      columnSizing,
      sorting,
      rowSelection,
    },
    columnResizeMode: enableResizing ? "onChange" : undefined,
    manualSorting: false,
    enableRowSelection: true,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) =>
      setRowSelection((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : (updater ?? {});
        onSelectionChange?.(Object.keys(next).length);
        return next;
      }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const hasContent = rows.length > 0;

  // Performance optimization for column sizing
  const { columnSizingInfo, columnSizing: columnSizingState } =
    table.getState();
  const getFlatHeaders = table.getFlatHeaders;
  const colLength = table.getAllColumns().length;

  const columnSizeVars = useMemo(() => {
    const headers = getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
    // Disabled lint as per tanstack docs - dependencies are necessary for column resizing
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getFlatHeaders, columnSizingInfo, columnSizingState, colLength]);

  const body = hasContent ? (
    <tbody>
      {rows.map((row) => {
        return (
          <tr key={row.id} data-selected={row.getIsSelected()}>
            {row.getVisibleCells().map((cell) => {
              return (
                <td
                  key={cell.id}
                  style={{
                    width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                    maxWidth: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                    textWrap: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  ) : (
    <TableEmpty />
  );

  return (
    <div
      css={css`
        border: 1px solid var(--ac-global-border-color-default);
        border-radius: var(--ac-global-rounding-small);
        overflow: hidden;
      `}
    >
      <table
        css={selectableTableCSS}
        style={{
          ...columnSizeVars,
          width: table.getTotalSize(),
          minWidth: "100%",
        }}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  colSpan={header.colSpan}
                  key={header.id}
                  style={{
                    width: `calc(var(--header-${header.id}-size) * 1px)`,
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <>
                      <div
                        {...{
                          className:
                            header.column.getCanSort() && enableSorting
                              ? "sort"
                              : "",
                          onClick: enableSorting
                            ? header.column.getToggleSortingHandler()
                            : undefined,
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() ? (
                          <Icon
                            className="sort-icon"
                            svg={
                              header.column.getIsSorted() === "asc" ? (
                                <Icons.ArrowUpFilled />
                              ) : (
                                <Icons.ArrowDownFilled />
                              )
                            }
                          />
                        ) : null}
                      </div>
                      {enableResizing && (
                        <div
                          {...{
                            onMouseDown: header.getResizeHandler(),
                            onTouchStart: header.getResizeHandler(),
                            className: `resizer ${
                              header.column.getIsResizing() ? "isResizing" : ""
                            }`,
                          }}
                        />
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        {body}
      </table>
    </div>
  );
}

// Column definitions
const personColumns: ColumnDef<Person>[] = [
  {
    header: "Name",
    accessorKey: "name",
    size: 200,
    cell: ({ getValue }) => <strong>{getValue() as string}</strong>,
  },
  {
    header: "Age",
    accessorKey: "age",
    size: 80,
    cell: IntCell,
  },
  {
    header: "Email",
    accessorKey: "email",
    size: 250,
    cell: TextCell,
  },
  {
    header: "Salary",
    accessorKey: "salary",
    size: 120,
    cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 100,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <span
          css={css`
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            background-color: ${status === "active"
              ? "var(--ac-global-color-success-100)"
              : "var(--ac-global-color-grey-100)"};
            color: ${status === "active"
              ? "var(--ac-global-color-success-900)"
              : "var(--ac-global-color-grey-700)"};
          `}
        >
          {status}
        </span>
      );
    },
  },
  {
    header: "Department",
    accessorKey: "department",
    size: 150,
    cell: TextCell,
  },
];

const productColumns: ColumnDef<Product>[] = [
  {
    header: "Product",
    accessorKey: "name",
    size: 200,
    cell: ({ getValue }) => <strong>{getValue() as string}</strong>,
  },
  {
    header: "Price",
    accessorKey: "price",
    size: 100,
    cell: FloatCell,
  },
  {
    header: "Category",
    accessorKey: "category",
    size: 120,
    cell: TextCell,
  },
  {
    header: "In Stock",
    accessorKey: "inStock",
    size: 100,
    cell: ({ getValue }) => (getValue() ? "✅ Yes" : "❌ No"),
  },
  {
    header: "Rating",
    accessorKey: "rating",
    size: 100,
    cell: ({ getValue }) => `⭐ ${getValue()}`,
  },
];

// ------------------------------
// Selection Support
// ------------------------------

// Column used to display row selection checkboxes – adapted from project SpansTable
const selectionColumn: ColumnDef<Person> = {
  id: "select",
  size: 30,
  maxSize: 30,
  header: ({ table }) => (
    <IndeterminateCheckboxCell
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <IndeterminateCheckboxCell
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      indeterminate={row.getIsSomeSelected()}
      onChange={row.getToggleSelectedHandler()}
    />
  ),
  enableSorting: false,
};

// Table component that prepends the selection column
const PersonTableSelectable = (props: {
  enableResizing?: boolean;
  enableSorting?: boolean;
  data?: Person[];
  onSelectionChange?: (count: number) => void;
}) => {
  const columns = useMemo<ColumnDef<Person>[]>(
    () => [selectionColumn, ...personColumns],
    []
  );

  return (
    <BaseTable
      columns={columns}
      data={props.data || mockPeople}
      enableResizing={props.enableResizing}
      enableSorting={props.enableSorting}
      onSelectionChange={props.onSelectionChange}
    />
  );
};

// Story Components
const PersonTable = (props: {
  enableResizing?: boolean;
  enableSorting?: boolean;
  data?: Person[];
}) => (
  <BaseTable
    columns={personColumns}
    data={props.data || mockPeople}
    enableResizing={props.enableResizing}
    enableSorting={props.enableSorting}
  />
);

const ProductTable = (props: {
  enableResizing?: boolean;
  enableSorting?: boolean;
  data?: Product[];
}) => (
  <BaseTable
    columns={productColumns}
    data={props.data || mockProducts}
    enableResizing={props.enableResizing}
    enableSorting={props.enableSorting}
  />
);

const meta: Meta<typeof PersonTable> = {
  title: "Table/Table",
  component: PersonTable,
  parameters: {
    docs: {
      description: {
        component: `
A flexible table component built with TanStack Table that supports:
- **Column Resizing**: Drag column borders to resize
- **Sorting**: Click column headers to sort data
- **Row Selection**: Select rows for bulk actions
- **Performance Optimized**: Uses CSS variables for efficient column sizing

The table automatically handles empty states and provides a consistent API for different data types.
        `,
      },
    },
  },
  argTypes: {
    enableResizing: {
      control: { type: "boolean" },
      description: "Enable column resizing by dragging column borders",
    },
    enableSorting: {
      control: { type: "boolean" },
      description: "Enable sorting by clicking column headers",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PersonTable>;

/**
 * Basic table with resizable columns.
 * Drag the column borders to resize columns.
 */
export const Basic: Story = {
  args: {
    enableResizing: true,
    enableSorting: true,
  },
};

/**
 * Table with product data showing different cell types.
 */
export const Product = {
  render: () => <ProductTable enableResizing={true} enableSorting={true} />,
};

/**
 * Table with no data to demonstrate empty state.
 */
export const Empty: Story = {
  args: {
    enableResizing: true,
    enableSorting: true,
    data: [],
  },
};

const SelectableStoryComponent = () => {
  const [selectedCount, setSelectedCount] = useState(0);
  return (
    <div style={{ position: "relative" }}>
      {selectedCount > 0 && (
        <FloatingToolbarContainer>
          <Toolbar>
            <TooltipTrigger delay={0}>
              <IconButton onPress={() => setSelectedCount(0)}>
                <Icon svg={<Icons.CloseOutline />} />
              </IconButton>
              <Tooltip>Clear selection</Tooltip>
            </TooltipTrigger>
            <View paddingEnd="size-100">
              <Text>{`${selectedCount} row${selectedCount > 1 ? "s" : ""} selected`}</Text>
            </View>

            <Button
              variant="danger"
              size="M"
              leadingVisual={<Icon svg={<Icons.TrashOutline />} />}
            >
              Delete
            </Button>
          </Toolbar>
        </FloatingToolbarContainer>
      )}
      <PersonTableSelectable
        enableResizing={true}
        enableSorting={true}
        onSelectionChange={setSelectedCount}
      />
    </div>
  );
};

export const Selectable = {
  render: () => <SelectableStoryComponent />,
};
