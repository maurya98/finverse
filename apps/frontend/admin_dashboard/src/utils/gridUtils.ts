import type { GridItem } from "../components/common/GridCard";

/**
 * Generate sample grid items for demo/testing purposes.
 */
export const generateGridItems = (count = 8): GridItem[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `item-${i + 1}`,
    title: `Item ${i + 1}`,
    description: `This is a description for item ${i + 1}.`,
    active: i % 2 === 0,
    actions: [],
  }));
