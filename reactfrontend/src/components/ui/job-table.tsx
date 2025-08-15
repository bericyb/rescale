import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { Button } from './button';

interface Job {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  current_status: {
    status_type: string;
    timestamp: string;
  };
}

interface JobTableProps {
  jobs: Job[];
  onFetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onJobClick?: (job: Job) => void;
  onDeleteJob?: (job: Job) => void;
}

const columnHelper = createColumnHelper<Job>();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'RUNNING': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getColumns = (onDeleteJob?: (job: Job) => void) => [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: info => (
      <span className="font-mono text-sm text-gray-600">
        #{info.getValue().toString().padStart(4, '0')}
      </span>
    ),
    size: 80,
    minSize: 60,
    maxSize: 100,
  }),
  columnHelper.accessor('name', {
    header: 'Job Name',
    cell: info => (
      <span className="font-semibold text-gray-900 truncate block">
        {info.getValue()}
      </span>
    ),
    size: 300,
    minSize: 200,
    maxSize: 1000,
  }), columnHelper.accessor('current_status.status_type', {
    header: 'Status',
    cell: info => (
      <div className="flex justify-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(info.getValue())}`}>
          {info.getValue()}
        </span>
      </div>
    ),
    size: 140,
    minSize: 120,
    maxSize: 160,
  }),
  columnHelper.accessor('created_at', {
    header: 'Created',
    cell: info => (
      <div className="text-sm text-gray-600">
        <div>{new Date(info.getValue()).toLocaleDateString()}</div>
        <div className="text-xs text-gray-400">
          {new Date(info.getValue()).toLocaleTimeString()}
        </div>
      </div>
    ),
    size: 140,
    minSize: 120,
    maxSize: 160,
  }),
  columnHelper.accessor('updated_at', {
    header: 'Last Updated',
    cell: info => (
      <div className="text-sm text-gray-600">
        <div>{new Date(info.getValue()).toLocaleDateString()}</div>
        <div className="text-xs text-gray-400">
          {new Date(info.getValue()).toLocaleTimeString()}
        </div>
      </div>
    ),
    size: 140,
    minSize: 120,
    maxSize: 160,
  }),
  columnHelper.display({
    header: 'Details',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link href={`/jobs/${row.original.id}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => e.stopPropagation()} // Prevent row click
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    ),
    size: 100,
    minSize: 80,
    maxSize: 120,
  }),
  columnHelper.display({
    header: 'Delete',
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteJob?.(row.original);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
    size: 100,
    minSize: 80,
    maxSize: 120,
  }),
];

export function JobTable({ jobs, onFetchNextPage, hasNextPage, isFetchingNextPage, onJobClick, onDeleteJob }: JobTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = getColumns(onDeleteJob);

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    debugTable: false,
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const lastItem = virtualItems[virtualItems.length - 1];
  if (
    lastItem &&
    lastItem.index >= rows.length - 5 &&
    hasNextPage &&
    !isFetchingNextPage &&
    onFetchNextPage
  ) {
    onFetchNextPage();
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        {table.getHeaderGroups().map(headerGroup => (
          <div key={headerGroup.id} className="flex min-w-full">
            {headerGroup.headers.map(header => (
              <div
                key={header.id}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                style={{
                  width: header.id === 'name' ? 'auto' : `${header.getSize()}px`,
                  flexGrow: header.id === 'name' ? 1 : 0,
                  flexShrink: header.id === 'name' ? 1 : 0,
                  minWidth: header.id === 'name' ? '200px' : `${header.getSize()}px`
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Body */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto bg-white"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map(virtualRow => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                className="absolute top-0 left-0 w-full flex hover:bg-gray-50 transition-colors border-b border-gray-100 min-w-full cursor-pointer"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => onJobClick?.(jobs[virtualRow.index])}
              >
                {row.getVisibleCells().map(cell => (
                  <div
                    key={cell.id}
                    className="px-6 py-4 border-r border-gray-100 last:border-r-0 flex items-center"
                    style={{
                      width: cell.column.id === 'name' ? 'auto' : `${cell.column.getSize()}px`,
                      flexGrow: cell.column.id === 'name' ? 1 : 0,
                      flexShrink: cell.column.id === 'name' ? 1 : 0,
                      minWidth: cell.column.id === 'name' ? '200px' : `${cell.column.getSize()}px`
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-center text-sm text-gray-600">
          Loading more jobs...
        </div>
      )}
    </div>
  )
}
