import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { useMarkMortgageAsReAdvanceable, useHelocAccounts } from "@/features/heloc/hooks";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/ui/alert";

const markReAdvanceableSchema = z.object({
  helocAccountId: z.string().min(1, "Please select a HELOC account"),
  confirm: z.boolean().refine((val) => val === true, {
    message: "Please confirm that you want to mark this mortgage as re-advanceable",
  }),
});

type MarkReAdvanceableFormData = z.infer<typeof markReAdvanceableSchema>;

interface MarkReAdvanceableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mortgageId: string;
}

export function MarkReAdvanceableDialog({
  open,
  onOpenChange,
  mortgageId,
}: MarkReAdvanceableDialogProps) {
  const { toast } = useToast();
  const markAsReAdvanceable = useMarkMortgageAsReAdvanceable();
  const { data: helocAccounts, isLoading } = useHelocAccounts();

  const form = useForm<MarkReAdvanceableFormData>({
    resolver: zodResolver(markReAdvanceableSchema),
    defaultValues: {
      helocAccountId: "",
      confirm: false,
    },
  });

  const onSubmit = async (data: MarkReAdvanceableFormData) => {
    try {
      await markAsReAdvanceable.mutateAsync({
        mortgageId,
        helocAccountId: data.helocAccountId,
      });
      toast({
        title: "Mortgage Marked as Re-advanceable",
        description:
          "Your mortgage has been successfully linked to the HELOC account. Credit room will update automatically with payments.",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to mark mortgage as re-advanceable",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Mortgage as Re-advanceable</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!helocAccounts || helocAccounts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Mortgage as Re-advanceable</DialogTitle>
            <DialogDescription>
              You need at least one HELOC account to mark a mortgage as re-advanceable.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please create a HELOC account first before marking this mortgage as re-advanceable.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Mortgage as Re-advanceable</DialogTitle>
          <DialogDescription>
            Link a HELOC account to this mortgage to enable automatic credit room updates. Credit
            room will increase automatically as you make principal payments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="helocAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HELOC Account</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a HELOC account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {helocAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{account.accountName}</span>
                            <span className="text-xs text-muted-foreground">
                              {account.lenderName} • Credit Limit:{" "}
                              {new Intl.NumberFormat("en-CA", {
                                style: "currency",
                                currency: "CAD",
                              }).format(Number(account.creditLimit))}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the HELOC account to link to this mortgage
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I understand this will link my HELOC to this mortgage</FormLabel>
                    <FormDescription>
                      Credit room will update automatically when you make principal payments. This
                      action can be reversed by unlinking the HELOC account.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={markAsReAdvanceable.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={markAsReAdvanceable.isPending}>
                {markAsReAdvanceable.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  "Mark as Re-advanceable"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
