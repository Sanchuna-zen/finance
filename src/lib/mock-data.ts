/**
 * This file contains mock data for development and testing purposes.
 * It provides fallback data when the real data sources are unavailable.
 */

// Mock expense data
export const mockExpenses = [
  { amount: 125.30, category: "Groceries" },
  { amount: 55.99, category: "Dining" },
  { amount: 200.00, category: "Utilities" },
  { amount: 12.99, category: "Subscriptions" },
  { amount: 45.00, category: "Transportation" },
  { amount: 89.99, category: "Entertainment" },
  { amount: 350.00, category: "Housing" },
  { amount: 75.50, category: "Shopping" },
];

// Mock investment data (with dates for the past 6 months)
export const mockInvestments = (() => {
  const data = [];
  const today = new Date();
  
  // Generate data points for the last 6 months
  for (let i = 0; i < 6; i++) {
    // Create date for this month
    const date = new Date(today);
    date.setMonth(today.getMonth() - (5 - i));
    
    // Add 1-3 investment entries per month
    const entriesThisMonth = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < entriesThisMonth; j++) {
      // Randomize the day within month
      const day = Math.floor(Math.random() * 28) + 1;
      date.setDate(day);
      
      // Create investment entry with amount between 500-2000
      const amount = Math.floor(Math.random() * 1500) + 500;
      const types = ["Stocks", "ETF", "Crypto", "Bonds", "Real Estate"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      data.push({
        amount,
        type,
        date: date.toISOString(),
      });
    }
  }
  
  return data;
})();

// Pre-calculated expense summary (based on mockExpenses)
export const mockExpenseSummary = {
  total: mockExpenses.reduce((sum, expense) => sum + expense.amount, 0),
  period: "Last 30 days",
  description: "Sum of all expenses in the last 30 days."
};

// Pre-calculated expense chart data
export const mockExpenseChartData = (() => {
  // Group expenses by category
  const categorySums: Record<string, number> = {};
  
  mockExpenses.forEach(expense => {
    if (!categorySums[expense.category]) {
      categorySums[expense.category] = 0;
    }
    categorySums[expense.category] += expense.amount;
  });
  
  return {
    labels: Object.keys(categorySums),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categorySums),
      }
    ]
  };
})();

// Pre-calculated investment chart data
export const mockInvestmentChartData = (() => {
  // Sort investments by date
  const sortedInvestments = [...mockInvestments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const labels: string[] = [];
  const data: number[] = [];
  let runningTotal = 0;
  
  sortedInvestments.forEach(investment => {
    runningTotal += investment.amount;
    const date = new Date(investment.date);
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    data.push(runningTotal);
  });
  
  return {
    labels,
    datasets: [
      {
        label: "Investment Growth",
        data,
      }
    ]
  };
})();

// Mock investment summary
export const mockInvestmentSummary = {
  total: mockInvestments.reduce((sum, investment) => sum + investment.amount, 0),
  period: "Last 6 months",
  description: "Growth of investments tracked over the last 6 months."
};