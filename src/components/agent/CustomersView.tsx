"use client";

import { useState } from "react";
import { CustomersStats } from "./CustomersStats";
import { CustomersTable } from "./CustomersTable";
import { CustomerDrawer } from "./CustomerDrawer";
import type { CustomerDetail } from "@/src/data/agentCustomers";

export function CustomersView() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (customer: CustomerDetail) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Optional: add a slight delay before clearing the customer to allow slide-out animation to finish smoothly
    setTimeout(() => {
      setSelectedCustomer(null);
    }, 300);
  };

  return (
    <div className="p-container-margin">
      <CustomersStats />
      <CustomersTable onRowClick={handleRowClick} />
      <CustomerDrawer
        isOpen={isDrawerOpen}
        customer={selectedCustomer}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
