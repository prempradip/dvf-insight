export interface CashFlowEntry {
  year: number;
  amount: number;
}

export interface FinancialInputs {
  id: string;
  featureId: string; // links to FeatureRow.id
  featureName: string;
  initialInvestment: number;
  cashFlows: CashFlowEntry[];
  discountRate: number; // as percentage, e.g. 10 = 10%
}

export interface FinancialResults {
  npv: number;
  irr: number | null;
  paybackPeriod: number | null;
  profitabilityIndex: number;
  dcfValues: number[]; // discounted value per year
}

export function createEmptyFinancialInput(featureId: string, featureName: string): FinancialInputs {
  return {
    id: crypto.randomUUID(),
    featureId,
    featureName,
    initialInvestment: 0,
    cashFlows: [
      { year: 1, amount: 0 },
      { year: 2, amount: 0 },
      { year: 3, amount: 0 },
      { year: 4, amount: 0 },
      { year: 5, amount: 0 },
    ],
    discountRate: 10,
  };
}

/** Discount a single cash flow */
function discountCF(amount: number, rate: number, year: number): number {
  return amount / Math.pow(1 + rate, year);
}

/** Net Present Value */
export function calcNPV(initialInvestment: number, cashFlows: CashFlowEntry[], discountRate: number): number {
  const r = discountRate / 100;
  const pvCashFlows = cashFlows.reduce((sum, cf) => sum + discountCF(cf.amount, r, cf.year), 0);
  return pvCashFlows - initialInvestment;
}

/** Discounted cash flow values per year */
export function calcDCFValues(cashFlows: CashFlowEntry[], discountRate: number): number[] {
  const r = discountRate / 100;
  return cashFlows.map((cf) => discountCF(cf.amount, r, cf.year));
}

/** Internal Rate of Return using Newton's method */
export function calcIRR(initialInvestment: number, cashFlows: CashFlowEntry[], maxIterations = 1000): number | null {
  if (cashFlows.length === 0 || initialInvestment === 0) return null;

  let guess = 0.1;

  for (let i = 0; i < maxIterations; i++) {
    let npv = -initialInvestment;
    let dnpv = 0;

    for (const cf of cashFlows) {
      const factor = Math.pow(1 + guess, cf.year);
      npv += cf.amount / factor;
      dnpv -= (cf.year * cf.amount) / (factor * (1 + guess));
    }

    if (Math.abs(npv) < 0.001) return guess * 100;
    if (dnpv === 0) return null;

    guess = guess - npv / dnpv;

    if (!isFinite(guess) || guess < -1) return null;
  }

  return null;
}

/** Payback Period (undiscounted, in years) */
export function calcPaybackPeriod(initialInvestment: number, cashFlows: CashFlowEntry[]): number | null {
  if (initialInvestment <= 0) return 0;

  let cumulative = 0;
  const sorted = [...cashFlows].sort((a, b) => a.year - b.year);

  for (let i = 0; i < sorted.length; i++) {
    const prevCumulative = cumulative;
    cumulative += sorted[i].amount;

    if (cumulative >= initialInvestment) {
      // Interpolate within the year
      const remaining = initialInvestment - prevCumulative;
      const fraction = sorted[i].amount > 0 ? remaining / sorted[i].amount : 0;
      return (i > 0 ? sorted[i - 1].year : 0) + fraction;
    }
  }

  return null; // Never pays back
}

/** Profitability Index */
export function calcProfitabilityIndex(initialInvestment: number, cashFlows: CashFlowEntry[], discountRate: number): number {
  if (initialInvestment === 0) return 0;
  const r = discountRate / 100;
  const pvCashFlows = cashFlows.reduce((sum, cf) => sum + discountCF(cf.amount, r, cf.year), 0);
  return pvCashFlows / initialInvestment;
}

/** Calculate all financial results */
export function calcAllFinancials(input: FinancialInputs): FinancialResults {
  return {
    npv: calcNPV(input.initialInvestment, input.cashFlows, input.discountRate),
    irr: calcIRR(input.initialInvestment, input.cashFlows),
    paybackPeriod: calcPaybackPeriod(input.initialInvestment, input.cashFlows),
    profitabilityIndex: calcProfitabilityIndex(input.initialInvestment, input.cashFlows, input.discountRate),
    dcfValues: calcDCFValues(input.cashFlows, input.discountRate),
  };
}
