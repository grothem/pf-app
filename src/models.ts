export interface Item {
  id: string;
  bidNumber: number;
  itemNumber: string;
  itemDescription: string;
  price: number;
  paid: boolean;
}

export type CreateItem = Omit<Item, "id">;
