import { createClient } from "@/lib/supabase/server";

// Helper to fetch and assemble dashboard data
export async function getDashboardFinancialData() {
  const supabase = createClient();

  // Fetch expense summary (example: last 30 days)
  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, category")
    .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Fetch investment summary (example: last 6 months)
  const { data: investments, error: investmentsError } = await supabase
    .from("investments")
    .select("amount, type, date")
    .gte("date", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

  // Calculate expense summary
  let expenseSummary = {
    total: 0,
    period: "Last 30 days",
    description: "Sum of all expenses in the last 30 days.",
  };
  let expenseChartData = {
    labels: [],
    datasets: [],
  };

  if (expenses && expenses.length > 0) {
    const totalsByCategory: Record<string, number> = {};
    for (const e of expenses) {
      totalsByCategory[e.category] = (totalsByCategory[e.category] || 0) + e.amount;
      expenseSummary.total += e.amount;
    }
    expenseChartData = {
      labels: Object.keys(totalsByCategory),
      datasets: [
        {
          label: "Expenses",
          data: Object.values(totalsByCategory),
        },
      ],
    };
  }

  // Calculate investment insights
  let investmentInsights = {
    total: 0,
    period: "Last 6 months",
    description: "Growth of investments tracked over the last 6 months.",
  };
  let investmentChartData = {
    labels: [],
    datasets: [],
  };

  if (investments && investments.length > 0) {
    // Sort by date ascending (for line chart)
    const sorted = [...investments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningTotal = 0;
    const labels: string[] = [];
    const data: number[] = [];
    for (const i of sorted) {
      runningTotal += i.amount;
      labels.push(new Date(i.date).toLocaleDateString());
      data.push(runningTotal);
      investmentInsights.total += i.amount;
    }
    investmentChartData = {
      labels,
      datasets: [
        {
          label: "Investment Value",
          data,
        },
      ],
    };
  }

  return {
    expenseSummary,
    investmentInsights,
    expenseChartData,
    investmentChartData,
  };
}
