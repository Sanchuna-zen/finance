import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { getDashboardFinancialData } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  // Fetch data server-side (RSC pattern)
  const {
    expenseSummary,
    investmentInsights,
    expenseChartData,
    investmentChartData,
  } = await getDashboardFinancialData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f0f6ff] px-4 py-8 sm:px-8 md:px-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600">
          Your personalized overview and insights for better financial decisions.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Expense Tracking Card */}
        <Card className="relative bg-gradient-to-tr from-indigo-50 to-blue-100 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl p-6">
          <div className="flex flex-col h-full">
            <h2 className="font-semibold text-xl text-indigo-800 mb-4 flex items-center gap-2">
              <svg width="28" height="28" fill="none" className="inline-block"><circle cx="14" cy="14" r="13" stroke="#6366f1" strokeWidth="2"/><path d="M9 14h6a3 3 0 100-6h-1" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/></svg>
              Expense Tracking
            </h2>
            <div className="mb-6">
              <div className="flex items-end gap-4">
                <span className="text-3xl font-bold text-indigo-700">
                  ${expenseSummary.total.toLocaleString()}
                </span>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {expenseSummary.period}
                </span>
              </div>
              <div className="text-slate-500 mt-2">
                {expenseSummary.description}
              </div>
            </div>
            <div className="mt-auto">
              <Suspense fallback={<div className="h-36 rounded-2xl bg-indigo-100 animate-pulse"></div>}>
                <Chart
                  type="bar"
                  title="Expenses By Category"
                  data={expenseChartData}
                  className="h-36"
                  color="indigo"
                />
              </Suspense>
            </div>
          </div>
        </Card>

        {/* Investment Insights Card */}
        <Card className="relative bg-gradient-to-tr from-green-50 to-teal-100 border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 rounded-3xl p-6">
          <div className="flex flex-col h-full">
            <h2 className="font-semibold text-xl text-emerald-900 mb-4 flex items-center gap-2">
              <svg width="28" height="28" fill="none" className="inline-block"><circle cx="14" cy="14" r="13" stroke="#10b981" strokeWidth="2"/><path d="M14 7v7h5" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/></svg>
              Investment Insights
            </h2>
            <div className="mb-6">
              <div className="flex items-end gap-4">
                <span className="text-3xl font-bold text-emerald-700">
                  ${investmentInsights.total.toLocaleString()}
                </span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {investmentInsights.period}
                </span>
              </div>
              <div className="text-slate-500 mt-2">
                {investmentInsights.description}
              </div>
            </div>
            <div className="mt-auto">
              <Suspense fallback={<div className="h-36 rounded-2xl bg-emerald-100 animate-pulse"></div>}>
                <Chart
                  type="line"
                  title="Investment Growth"
                  data={investmentChartData}
                  className="h-36"
                  color="emerald"
                />
              </Suspense>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
