from pathlib import Path

path = Path("client/src/features/mortgage-tracking/mortgage-feature.tsx")
text = path.read_text()
start_marker = "      {uiCurrentTerm && ("
end_marker = "      <Card className=\"border-primary\""
start = text.find(start_marker)
end = text.find(end_marker, start)
if start == -1 or end == -1 or end <= start:
    raise SystemExit("markers not found")
replacement = (
    "      {uiCurrentTerm && (\n"
    "        <BackfillPaymentsDialog\n"
    "          open={isBackfillOpen}\n"
    "          onOpenChange={setIsBackfillOpen}\n"
    "          currentTerm={uiCurrentTerm}\n"
    "          mortgage={mortgage}\n"
    "          backfillStartDate={backfillStartDate}\n"
    "          setBackfillStartDate={setBackfillStartDate}\n"
    "          backfillNumberOfPayments={backfillNumberOfPayments}\n"
    "          setBackfillNumberOfPayments={setBackfillNumberOfPayments}\n"
    "          backfillPaymentAmount={backfillPaymentAmount}\n"
    "          setBackfillPaymentAmount={setBackfillPaymentAmount}\n"
    "          previewEndDate={previewBackfillEndDate}\n"
    "          primeRateData={primeRateData}\n"
    "          backfillMutation={{\n"
    "            mutate: (payload) => backfillPaymentsMutation.mutate(payload),\n"
    "            isPending: backfillPaymentsMutation.isPending,\n"
    "          }}\n"
    "        />\n"
    "      )}\n"
    "\n"
)
path.write_text(text[:start] + replacement + text[end:])

