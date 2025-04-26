import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HospitalDetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <div className="flex items-center gap-1">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-5 w-5 rounded-full" />
                  ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
