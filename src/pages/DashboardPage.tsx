
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "@/assets/json/dashboard.json"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
             
             <div className="mx-4 lg:mx-6">
                <Card>
                  <CardContent>
                    <DataTable data={data} />
                  </CardContent>
              </Card>
             </div>
              
            </div>
          </div>
  )
}
