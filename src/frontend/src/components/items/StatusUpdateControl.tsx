import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Status } from "../../backend";
import { useUpdateItemStatus } from "../../hooks/useQueries";
import { getUserFriendlyError } from "../../utils/errors";

interface StatusUpdateControlProps {
  itemId: string;
  currentStatus: Status;
  canUpdate: boolean;
}

export default function StatusUpdateControl({
  itemId,
  currentStatus,
  canUpdate,
}: StatusUpdateControlProps) {
  const [selectedStatus, setSelectedStatus] = useState<Status>(currentStatus);
  const updateMutation = useUpdateItemStatus();

  const statusOptions = [
    { value: "missing" as Status, label: "Still Missing" },
    { value: "claimed" as Status, label: "Claimed" },
    { value: "returned" as Status, label: "Returned" },
  ];

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) return;

    try {
      await updateMutation.mutateAsync({ itemId, newStatus: selectedStatus });
      toast.success("Item status updated successfully");
    } catch (error) {
      const errorMessage = getUserFriendlyError(error);
      toast.error(errorMessage);
      setSelectedStatus(currentStatus); // Reset on error
    }
  };

  if (!canUpdate) {
    return null;
  }

  const hasChanged = selectedStatus !== currentStatus;

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <Label>Update Status</Label>
      <div className="flex gap-2">
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as Status)}
          disabled={updateMutation.isPending}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleUpdate}
          disabled={!hasChanged || updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update"
          )}
        </Button>
      </div>
    </div>
  );
}
