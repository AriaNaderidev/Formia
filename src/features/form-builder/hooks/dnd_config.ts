import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type Modifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { isPaletteId } from "@/features/form-schema";

export const CANVAS_DROPPABLE_ID = "main-area";

/**
 * Reordering: only compare against the fields themselves.
 * The canvas is one big droppable that contains every field, so with the default
 * rectIntersection it often "wins" over the neighbouring field. The sortable list
 * then loses its `over` target and items snap back instead of swapping.
 *
 * Adding from the palette keeps the default behaviour.
 */
export const formBuilderCollision: CollisionDetection = (args) => {
  if (isPaletteId(args.active.id)) return rectIntersection(args);

  return closestCenter({
    ...args,
    droppableContainers: args.droppableContainers.filter(
      (container) => container.id !== CANVAS_DROPPABLE_ID,
    ),
  });
};

/** Keeps a reordered field on a vertical rail. Palette drags stay free. */
export const restrictReorderToYAxis: Modifier = ({ active, transform }) =>
  active && !isPaletteId(active.id) ? { ...transform, x: 0 } : transform;

// Module-level so the sensors keep a stable identity between renders.
const POINTER_OPTIONS = { activationConstraint: { distance: 4 } };
const KEYBOARD_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates };

export const useFormBuilderSensors = () =>
  useSensors(
    useSensor(PointerSensor, POINTER_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_OPTIONS),
  );
