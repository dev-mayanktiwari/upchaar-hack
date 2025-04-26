import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HospitalSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-1">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-4 w-4 rounded-full" />
              ))}
            <Skeleton className="h-4 w-12 ml-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="flex gap-1">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-5 w-16" />
              ))}
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
