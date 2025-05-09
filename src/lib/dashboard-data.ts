import { createClient } from "@/utils/supabase/server";
import { 
  mockExpenses, 
  mockInvestments, 
  mockExpenseSummary, 
  mockExpenseChartData, 
  mockInvestmentChartData, 
  mockInvestmentSummary 
} from "./mock-data";

// Define interface types for the data
interface Expense {
  amount: number;
  category: string;
}

interface Investment {
  amount: number;
  type: string;
  date: string;
}

// Helper to fetch and assemble dashboard data
export async function getDashboardFinancialData() {
  const supabase = await createClient();
  
  // Define date constants for better maintainability
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
  
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
  const sixMonthsAgo = new Date(Date.now() - SIX_MONTHS_MS).toISOString();

  // Add error handling with more specific fallbacks
  let expenses: Expense[] = [];
  let expensesError: Error | null = null;
  let investments: Investment[] = [];
  let investmentsError: Error | null = null;

  try {
    // Fetch expense summary (last 30 days)
    const { data, error } = await supabase
      .from("expenses")
      .select("amount, category")
      .gte("date", thirtyDaysAgo);
    
    if (error) throw error;
    expenses = data as Expense[] || [];
  } catch (error: any) {
    console.error("Error fetching expenses:", error.message);
    expensesError = error;
    // Use mock data as fallback
    expenses = mockExpenses;
  }

  try {
    // Fetch investment summary (last 6 months)
    const { data, error } = await supabase
      .from("investments")
      .select("amount, type, date")
      .gte("date", sixMonthsAgo);
    
    if (error) throw error;
    investments = data as Investment[] || [];
  } catch (error: any) {
    console.error("Error fetching investments:", error.message);
    investmentsError = error;
    // Use mock data as fallback
    investments = mockInvestments;
  }

  // Calculate expense summary
  let expenseSummary = {
    total: 0,
    period: "Last 30 days",
    description: "Sum of all expenses in the last 30 days.",
  };
  
  type ChartDataset = { label: string; data: number[] };
  
  let expenseChartData: {
    labels: string[];
    datasets: ChartDataset[];
  } = {
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
  } else {
    // Use pre-calculated mock data if no expenses
    expenseSummary = mockExpenseSummary;
    expenseChartData = mockExpenseChartData;
  }

  // Calculate investment insights
  let investmentInsights = {
    total: 0,
    period: "Last 6 months",
    description: "Growth of investments tracked over the last 6 months.",
  };
  
  let investmentChartData: {
    labels: string[];
    datasets: ChartDataset[];
  } = {
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
  } else {
    // Use pre-calculated mock data if no investments
    investmentInsights = mockInvestmentSummary;
    investmentChartData = mockInvestmentChartData;
  }

  return {
    expenseSummary,
    investmentInsights,
    expenseChartData,
    investmentChartData,
    errors: {
      expenses: expensesError ? expensesError.message : null,
      investments: investmentsError ? investmentsError.message : null
    }
  };
}
