import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Activity, ArrowUpRight, ArrowDownLeft, Settings, FileText } from "lucide-react";
import { ScrollArea } from "@/shared/ui/scroll-area";

// In a real app, these would come from an API. For MVP/Redesign, we'll mock or format real data if available.
export interface ActivityItem {
  id: string;
  type: "payment" | "rate_change" | "scenario" | "system";
  title: string;
  date: string;
  amount?: string;
  originalDate?: Date; // For sorting
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {items.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No recent activity.
              </div>
            )}
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-sm">
                <div
                  className={`
                  p-2 rounded-full mt-0.5
                  ${item.type === "payment" ? "bg-green-100 text-green-600" : ""}
                  ${item.type === "rate_change" ? "bg-orange-100 text-orange-600" : ""}
                  ${item.type === "scenario" ? "bg-blue-100 text-blue-600" : ""}
                  ${item.type === "system" ? "bg-gray-100 text-gray-600" : ""}
                `}
                >
                  {item.type === "payment" && <ArrowUpRight className="h-3 w-3" />}
                  {item.type === "rate_change" && <Activity className="h-3 w-3" />}
                  {item.type === "scenario" && <FileText className="h-3 w-3" />}
                  {item.type === "system" && <Settings className="h-3 w-3" />}
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium leading-none">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                {item.amount && (
                  <div className="font-medium text-xs tabular-nums">{item.amount}</div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
