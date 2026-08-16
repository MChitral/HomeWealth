import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { mortgageApi, mortgageQueryKeys, type StatementPreview } from "../api/mortgage-api";

type StatementIngestDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
};

export function StatementIngestDialog({
  open,
  onOpenChange,
  mortgageId,
}: StatementIngestDialogProps) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<StatementPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supersede, setSupersede] = useState(false);

  const upload = useMutation({
    mutationFn: (file: File) => mortgageApi.uploadStatement(mortgageId, file),
    onSuccess: (data) => {
      setPreview(data);
      setError(null);
      setSupersede(false);
    },
    onError: (err: Error) => {
      setPreview(null);
      setError(err.message);
    },
  });

  const reject = useMutation({
    mutationFn: () => mortgageApi.rejectStatement(mortgageId, preview!.stagedId),
    onSuccess: () => {
      setPreview(null);
      setSupersede(false);
      onOpenChange(false);
    },
  });

  const confirm = useMutation({
    mutationFn: () =>
      mortgageApi.confirmStatement(mortgageId, preview!.stagedId, { supersede }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgageId) });
      await queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.statementFacts(mortgageId) });
      await queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
      setPreview(null);
      setSupersede(false);
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message);
      if (err.message.includes("Re-upload requires explicit supersede")) {
        setSupersede(true);
      }
    },
  });

  const facts = preview?.facts ?? {};
  const confirmEnabled = Boolean(preview?.confirmEnabled && preview.proofs.canConfirm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload statement</DialogTitle>
          <DialogDescription>
            Preview extracted fields, then confirm. Nothing is written until you confirm.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="file"
          accept="application/pdf"
          data-testid="input-statement-pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload.mutate(file);
          }}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {preview && (
          <div className="space-y-2 text-sm" data-testid="statement-preview">
            <p>Type: {preview.documentType}</p>
            <p>Period: {preview.statementPeriod}</p>
            {"availableCredit" in facts && <p>Available credit: {String(facts.availableCredit)}</p>}
            {"mortgageOutstanding" in facts && (
              <p>Mortgage outstanding: {String(facts.mortgageOutstanding)}</p>
            )}
            {"paymentsReceived" in facts && <p>Payments received: {String(facts.paymentsReceived)}</p>}
            <p className="text-muted-foreground">
              Principal and interest shown after confirm are derived from the balance change.
            </p>
            {preview.suggestedPrivilege?.type === "double_up" && (
              <p>Suggested privilege: Double-Up (not applied until a disclosure confirm)</p>
            )}
            {!confirmEnabled && (
              <p data-testid="confirm-blocked">Confirm is unavailable for this preview.</p>
            )}
            {supersede && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={supersede}
                  data-testid="checkbox-supersede"
                  onChange={(event) => setSupersede(event.target.checked)}
                />
                Replace the confirmed statement for this period
              </label>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => (preview ? reject.mutate() : onOpenChange(false))}>
            {preview ? "Reject" : "Close"}
          </Button>
          <Button
            data-testid="button-confirm-statement"
            disabled={!confirmEnabled || confirm.isPending}
            onClick={() => confirm.mutate()}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
