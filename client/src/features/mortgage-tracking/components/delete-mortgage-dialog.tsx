import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Mortgage } from "@shared/schema";

interface DeleteMortgageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgage: Mortgage | null;
  deleteMortgageMutation: UseMutationResult<{ success: boolean }, Error, string, unknown>;
  onDeleteSuccess?: () => void;
}

export function DeleteMortgageDialog({
  open,
  onOpenChange,
  mortgage,
  deleteMortgageMutation,
  onDeleteSuccess,
}: DeleteMortgageDialogProps) {
  const handleDeleteConfirm = () => {
    if (mortgage?.id) {
      deleteMortgageMutation.mutate(mortgage.id, {
        onSuccess: () => {
          onOpenChange(false);
          if (onDeleteSuccess) {
            onDeleteSuccess();
          }
        },
      });
    }
  };

  const propertyPrice = mortgage?.propertyPrice
    ? `$${Number(mortgage.propertyPrice).toLocaleString()}`
    : "this mortgage";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Mortgage</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the mortgage for {propertyPrice}? This will permanently
            delete:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All mortgage terms and rate information</li>
              <li>All payment history</li>
              <li>All related data (renewals, recasts, etc.)</li>
            </ul>
            <span className="block mt-2 font-semibold text-destructive">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete-mortgage">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={deleteMortgageMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete-mortgage"
          >
            {deleteMortgageMutation.isPending ? "Deleting..." : "Delete Mortgage"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

