import { describe, it, expect } from "vitest";
import { calcNPV, calcIRR, calcPaybackPeriod, calcProfitabilityIndex, calcDCFValues } from "@/lib/financial-calc";

const cashFlows = [
  { year: 1, amount: 30000 },
  { year: 2, amount: 40000 },
  { year: 3, amount: 50000 },
];

describe("Financial Calculations", () => {
  it("calculates NPV correctly", () => {
    const npv = calcNPV(100000, cashFlows, 10);
    // PV = 30000/1.1 + 40000/1.21 + 50000/1.331 = 27272.73 + 33057.85 + 37565.74 = 97896.32
    // NPV = 97896.32 - 100000 = -2103.68
    expect(npv).toBeCloseTo(-2103.68, 0);
  });

  it("calculates DCF values correctly", () => {
    const dcf = calcDCFValues(cashFlows, 10);
    expect(dcf[0]).toBeCloseTo(27272.73, 0);
    expect(dcf[1]).toBeCloseTo(33057.85, 0);
    expect(dcf[2]).toBeCloseTo(37565.74, 0);
  });

  it("calculates IRR correctly", () => {
    const irr = calcIRR(100000, [
      { year: 1, amount: 50000 },
      { year: 2, amount: 50000 },
      { year: 3, amount: 50000 },
    ]);
    // IRR for -100k + 50k*3 ≈ 23.38%
    expect(irr).not.toBeNull();
    expect(irr!).toBeCloseTo(23.38, 0);
  });

  it("calculates payback period correctly", () => {
    const payback = calcPaybackPeriod(100000, cashFlows);
    // After Y1: 30k, After Y2: 70k, need 30k more from Y3's 50k → 2 + 30/50 = 2.6
    expect(payback).toBeCloseTo(2.6, 1);
  });

  it("returns null payback when never recovered", () => {
    const payback = calcPaybackPeriod(1000000, cashFlows);
    expect(payback).toBeNull();
  });

  it("calculates profitability index correctly", () => {
    const pi = calcProfitabilityIndex(100000, cashFlows, 10);
    // PI = 97896.32 / 100000 = 0.979
    expect(pi).toBeCloseTo(0.979, 2);
  });

  it("handles zero investment", () => {
    expect(calcPaybackPeriod(0, cashFlows)).toBe(0);
    expect(calcProfitabilityIndex(0, cashFlows, 10)).toBe(0);
  });
});
