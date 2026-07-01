import { useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { api } from "../lib/api";
import { toast } from "sonner";

type Transaction = {
  _id: string;
  item_id: string;
  order_id: string;
  seller_id: string;
  buyer_id: string;
  platinum: number;
  quantity: number;
  completedAt: string;
};

export function OrderActionButtons({
  orderId,
  itemName,
  onComplete,
  onDelete,
}: {
  orderId: string;
  itemName: string;
  onComplete?: (tx: Transaction) => void;
  onDelete?: () => void;
}) {
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="xs"
          onClick={() => setFinalizeOpen(true)}
          className="text-success hover:text-success"
          title="Finalize order"
        >
          <CheckIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
          title="Delete order"
        >
          <XIcon className="size-3.5" />
        </Button>
      </div>

      <FinalizeOrderDialog
        open={finalizeOpen}
        onOpenChange={setFinalizeOpen}
        orderId={orderId}
        itemName={itemName}
        onSuccess={(tx) => {
          setFinalizeOpen(false);
          onComplete?.(tx);
        }}
      />

      <DeleteOrderDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        orderId={orderId}
        onSuccess={() => {
          setDeleteOpen(false);
          onDelete?.();
        }}
      />
    </>
  );
}

function FinalizeOrderDialog({
  open,
  onOpenChange,
  orderId,
  itemName,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  itemName: string;
  onSuccess: (tx: Transaction) => void;
}) {
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!username.trim()) return;
    setSubmitting(true);
    try {
      const tx = await api.post<Transaction>("/api/transactions", {
        order_id: orderId,
        counterparty_username: username.trim(),
      });
      toast.success("Order finalized successfully");
      onSuccess(tx);
      setUsername("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to finalize order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Finalize Order</DialogTitle>
        <DialogDescription>
          Complete the transaction for <strong>{itemName}</strong>. Enter the username of the player you traded with.
        </DialogDescription>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Counterparty username</label>
          <input
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Enter their username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!username.trim() || submitting}>
            {submitting ? "Finalizing..." : "Finalize"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteOrderDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/orders/${orderId}`);
      toast.success("Order deleted");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Delete Order</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this order? This action cannot be undone.
        </DialogDescription>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={submitting}>
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
