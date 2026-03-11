import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { FeatureRow } from "@/lib/dvf-data";
import FeatureCard from "./FeatureCard";

interface Props {
  row: FeatureRow;
  index: number;
  onChange: (row: FeatureRow) => void;
  onDelete: () => void;
}

const SortableFeatureCard = ({ row, index, onChange, onDelete }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-1 top-3.5 z-10 p-1 rounded-md cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <div className="pl-6">
        <FeatureCard row={row} index={index} onChange={onChange} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default SortableFeatureCard;
