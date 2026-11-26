import { api } from "../lib/api";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  agentLimit: string;
  storageLimit: string;
  subscriptions: number;
  status: "Active" | "Draft" | "Inactive";
  billingCycle: "Monthly" | "Annual" | "Custom";
  highlighted?: boolean;
  icon: string;
}

export const pricingPlanService = {
  async getAll(): Promise<PricingPlan[]> {
    const res = await api.get("/pricing-plans");
    return res.data?.data || [];
  },

  async create(data: Partial<PricingPlan>): Promise<PricingPlan> {
    const res = await api.post("/pricing-plans", data);
    return res.data?.data;
  },

  async update(id: string, data: Partial<PricingPlan>): Promise<PricingPlan> {
    const res = await api.patch(`/pricing-plans/${id}`, data);
    return res.data?.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/pricing-plans/${id}`);
  },
};
