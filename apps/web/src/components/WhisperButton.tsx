import { CopyIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

function buildWhisper(opts: { username: string; itemName: string; orderType: "buy" | "sell"; platinum: number; rank?: number }) {
  const item = opts.rank != null ? `"${opts.itemName} (rank ${opts.rank})"` : `"${opts.itemName}"`;
  const action = opts.orderType === "sell" ? "buy" : "sell";
  return `/w ${opts.username} Hi! I want to ${action}: ${item} for ${opts.platinum} platinum. (warframe.market)`;
}

export function WhisperButton(opts: { username: string; itemName: string; orderType: "buy" | "sell"; platinum: number; rank?: number }) {
  const whisper = buildWhisper(opts);

  const copy = async () => {
    await navigator.clipboard.writeText(whisper);
    toast.success("Whisper copied to clipboard");
  };

  return (
    <Button variant="outline" size="xs" onClick={copy}>
      <CopyIcon className="size-3" />
      /w
    </Button>
  );
}
