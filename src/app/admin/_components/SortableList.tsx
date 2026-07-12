'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

/** Props the consumer spreads onto its drag-handle <button> (or passes to <DragHandle/>). */
export type SortableHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>;
};

export type SortableItemState = {
  handleProps: SortableHandleProps;
  isDragging: boolean;
};

export type SortableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  /** Human label used for the handle aria-label + screen-reader announcements. Defaults to the id. */
  getLabel?: (item: T) => string;
  /**
   * Persist the new order. Return true on success. Return false (or throw) to make
   * the list revert to its pre-drag order — the CALLER is responsible for toasts.
   */
  onReorder: (idsInNewOrder: string[]) => Promise<boolean>;
  renderItem: (item: T, state: SortableItemState) => React.ReactNode;
  disabled?: boolean;
};

/** Convenience grip-dots handle — `<DragHandle {...state.handleProps} />`. */
export function DragHandle(props: SortableHandleProps) {
  const { className, ...rest } = props;
  return (
    <button type="button" {...rest} className={`admin-drag-handle${className ? ` ${className}` : ''}`}>
      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
        <circle cx="9" cy="5" r="1.7" />
        <circle cx="15" cy="5" r="1.7" />
        <circle cx="9" cy="12" r="1.7" />
        <circle cx="15" cy="12" r="1.7" />
        <circle cx="9" cy="19" r="1.7" />
        <circle cx="15" cy="19" r="1.7" />
      </svg>
    </button>
  );
}

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'To pick up a sortable item, press space or enter. While dragging, use the arrow keys to move the item up or down. Press space or enter again to drop the item in its new position, or press escape to cancel.',
};

function SortableRow<T>({
  item,
  id,
  label,
  disabled,
  renderItem,
}: {
  item: T;
  id: string;
  label: string;
  disabled: boolean;
  renderItem: SortableListProps<T>['renderItem'];
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleProps: SortableHandleProps = {
    ...attributes,
    ...(listeners as React.DOMAttributes<HTMLButtonElement> | undefined),
    ref: setActivatorNodeRef,
    'aria-label': `Reorder: ${label}`,
    disabled: disabled || undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`admin-sortable-row${isDragging ? ' admin-sortable-row--ghost' : ''}`}
    >
      {renderItem(item, { handleProps, isDragging })}
    </li>
  );
}

export default function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  renderItem,
  disabled = false,
}: SortableListProps<T>) {
  // Internal optimistic copy — synced from props whenever the parent's array changes
  // (CRUD elsewhere, server refresh), adjusted immediately on drop, reverted on failure.
  const [list, setList] = useState(items);
  const [prevItems, setPrevItems] = useState(items);
  if (items !== prevItems) {
    setPrevItems(items);
    setList(items);
  }

  const [activeId, setActiveId] = useState<string | null>(null);

  // Announcements read from refs so they always see the current order without
  // re-binding the DndContext accessibility config. Announcements only fire from
  // drag events (never during render), so effect-synced refs are always current.
  const listRef = useRef(list);
  const getIdRef = useRef(getId);
  const getLabelRef = useRef(getLabel);
  useEffect(() => {
    listRef.current = list;
    getIdRef.current = getId;
    getLabelRef.current = getLabel;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const labelFor = useCallback((id: UniqueIdentifier): string => {
    const found = listRef.current.find((i) => getIdRef.current(i) === String(id));
    if (found === undefined) return String(id);
    return getLabelRef.current ? getLabelRef.current(found) : getIdRef.current(found);
  }, []);

  const positionOf = useCallback((id: UniqueIdentifier): number => {
    return listRef.current.findIndex((i) => getIdRef.current(i) === String(id)) + 1;
  }, []);

  const announcements = useMemo<Announcements>(
    () => ({
      onDragStart({ active }) {
        return `Picked up ${labelFor(active.id)}. Item is in position ${positionOf(active.id)} of ${listRef.current.length}.`;
      },
      onDragOver({ active, over }) {
        if (over) {
          return `${labelFor(active.id)} was moved over position ${positionOf(over.id)} of ${listRef.current.length}.`;
        }
        return undefined;
      },
      onDragEnd({ active, over }) {
        if (over) {
          return `${labelFor(active.id)} was dropped at position ${positionOf(over.id)} of ${listRef.current.length}.`;
        }
        return `${labelFor(active.id)} was dropped.`;
      },
      onDragCancel({ active }) {
        return `Reordering cancelled. ${labelFor(active.id)} returned to position ${positionOf(active.id)} of ${listRef.current.length}.`;
      },
    }),
    [labelFor, positionOf]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (disabled || !over || active.id === over.id) return;
    const oldIndex = list.findIndex((i) => getId(i) === String(active.id));
    const newIndex = list.findIndex((i) => getId(i) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const snapshot = list;
    const next = arrayMove(list, oldIndex, newIndex);
    setList(next); // optimistic
    void (async () => {
      let ok = false;
      try {
        ok = await onReorder(next.map(getId));
      } catch {
        ok = false;
      }
      if (!ok) setList(snapshot); // revert — caller surfaces the error toast
    })();
  };

  const activeItem = activeId !== null ? list.find((i) => getId(i) === activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{ announcements, screenReaderInstructions }}
    >
      <SortableContext items={list.map(getId)} strategy={verticalListSortingStrategy}>
        <ul className="admin-sortable-list">
          {list.map((item) => (
            <SortableRow
              key={getId(item)}
              item={item}
              id={getId(item)}
              label={getLabel ? getLabel(item) : getId(item)}
              disabled={disabled}
              renderItem={renderItem}
            />
          ))}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeItem !== undefined ? (
          <div className="admin-sortable-row admin-sortable-row--dragging">
            {renderItem(activeItem, {
              handleProps: {
                'aria-label': `Reorder: ${getLabel ? getLabel(activeItem) : getId(activeItem)}`,
                tabIndex: -1,
              },
              isDragging: true,
            })}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
