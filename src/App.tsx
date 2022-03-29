import React, { Fragment, useEffect, useMemo, useState } from "react";
import "./App.css";
import Airtable from "airtable";
import { CreateItem, Item } from "./models";
import { EditDialog } from "./EditDialog";
import { Table } from "./Table";
import { CreateDialog } from "./CreateDialog";
import { CheckoutDialog } from "./CheckoutDialog";
import CurrencyFormat from "react-currency-format";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.REACT_APP_AIRTABLE_APIKEY,
});

export const inputClass =
  "lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:highlight-white/5";

const PaidCell = ({ value }: any) => {
  return (
    <input
      className="checked:bg-blue-300 cursor-not-allowed"
      type="checkbox"
      checked={value}
      disabled={true}
    />
  );
};

const PriceCell = ({ value }: any) => {
  return (
    <CurrencyFormat
      className="text-sm text-gray-500"
      value={value}
      displayType={"text"}
      thousandSeparator={true}
      prefix={"$"}
      decimalScale={2}
    />
  );
};

const DescriptionCell = ({ value }: any) => {
  return (
    <p className="max-w-sm text-sm text-gray-500 whitespace-normal">{value}</p>
  );
};

function App() {
  const [items, setItems] = useState<Item[]>([]);

  const columns = useMemo(() => {
    return [
      {
        Header: "Items",
        columns: [
          {
            Header: "Bid Number",
            accessor: "bidNumber",
          },
          {
            Header: "Item Number",
            accessor: "itemNumber",
          },
          {
            Header: "Item Description",
            accessor: "itemDescription",
            Cell: DescriptionCell,
          },
          {
            Header: "Price",
            accessor: "price",
            Cell: PriceCell,
          },
          {
            Header: "Paid",
            accessor: "paid",
            Cell: PaidCell,
          },
        ],
      },
    ];
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      const base = Airtable.base("app1gjuCkFPG0GFrC");
      base
        .table("Table 1")
        .select()
        .eachPage((records, fetchNextPage) => {
          console.log(records);
          const items: Item[] = [];
          records.forEach((record) => {
            items.push({
              id: record.id,
              bidNumber: record.get("bidNumber") as number,
              itemNumber: record.get("itemNumber") as string,
              itemDescription: record.get("itemDescription") as string,
              price: record.get("price") as number,
              paid: record.get("paid") as boolean,
            });
          });
          setItems(items);
        });
    };

    fetchItems();
  }, []);

  const onItemAdded = async (item: CreateItem) => {
    const base = Airtable.base("app1gjuCkFPG0GFrC");
    const result = (
      await base.table("Table 1").create([
        {
          fields: {
            bidNumber: item.bidNumber,
            itemNumber: item.itemNumber,
            itemDescription: item.itemDescription,
            price: item.price,
          },
        },
      ])
    )[0];

    setItems((items) => [
      ...items,
      {
        id: result.id,
        bidNumber: result.get("bidNumber") as number,
        itemNumber: result.get("itemNumber") as string,
        itemDescription: result.get("itemDescription") as string,
        price: result.get("price") as number,
        paid: result.get("paid") as boolean,
      },
    ]);

    setShowCreateDialog(false);
  };

  const deleteItem = async (item: Item) => {
    if (!item.id) return;

    const base = Airtable.base("app1gjuCkFPG0GFrC");
    await base.table("Table 1").destroy([item.id]);
    setItems((items) => items.filter((i) => i.id !== item.id));
  };

  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const onAddNewItem = () => {
    setShowCreateDialog(true);
  };

  const closeCreateDialog = () => setShowCreateDialog(false);

  const [editItem, setEditItem] = useState<Item>();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const onEditItem = (item: Item) => {
    setShowEditDialog(true);
    setEditItem(item);
  };

  const saveEdit = async (editItems: Item[]) => {
    const base = Airtable.base("app1gjuCkFPG0GFrC");
    try {
      const updates = editItems.map((i) => {
        return {
          id: i.id,
          fields: {
            bidNumber: i.bidNumber,
            itemNumber: i.itemNumber,
            itemDescription: i.itemDescription,
            price: i.price,
            paid: i.paid,
          },
        };
      });
      await base.table("Table 1").update(updates);
      const existingItems = [...items];
      for (let i = 0; i < existingItems.length; i++) {
        for (let j = 0; j < editItems.length; j++) {
          if (existingItems[i].id === editItems[j].id) {
            existingItems[i] = editItems[j];
            break;
          }
        }
      }

      setItems(existingItems);
      closeEditDialog();
      closeCheckoutDialog();
    } catch (e) {
      console.log(e);
    }
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditItem(undefined);
  };

  let editDialog = <></>;
  if (editItem) {
    editDialog = (
      <EditDialog
        item={editItem}
        show={showEditDialog}
        onSave={(item) => saveEdit([item])}
        onClose={closeEditDialog}
      ></EditDialog>
    );
  }

  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutBidder, setCheckoutBidder] = useState<number>();
  const [checkoutItems, setCheckoutItems] = useState<Item[]>([]);
  const onCheckout = () => {
    const bidderItems = items.filter((i) => i.bidNumber === checkoutBidder);
    console.log(bidderItems);
    setCheckoutItems(bidderItems);
    setShowCheckoutDialog(true);
  };

  const closeCheckoutDialog = () => {
    setShowCheckoutDialog(false);
  };

  const onItemPaidToggled = (id: string, paid: boolean) => {
    const items = [...checkoutItems];
    const item = items.find((i) => i.id === id);
    if (item) {
      item.paid = paid;
    }
    setCheckoutItems(items);
  };

  const saveCheckout = () => {
    saveEdit(checkoutItems);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <main className="max-w-6xl mx-auto px-4 pt-4">
          <div className="flex items-center justify-between">
            <button
              className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm"
              onClick={onAddNewItem}
            >
              + Add Item
            </button>
            <div className="flex">
              <input
                className="lg:flex items-center text-sm leading-6 text-slate-400 rounded-l-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:highlight-white/5 w-12"
                value={checkoutBidder}
                onChange={(e) => setCheckoutBidder(Number(e.target.value))}
              />
              <button
                className="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-none shadow-sm rounded-r-md"
                onClick={onCheckout}
              >
                <div className="flex gap-2">
                  <img
                    width={20}
                    height={20}
                    src={require("./checkout.png")}
                    alt="checkout"
                  />
                  <span>Checkout</span>
                </div>
              </button>
            </div>
          </div>
          <div className="mt-6">
            <Table
              columns={columns}
              data={items}
              onDelete={deleteItem}
              onEdit={onEditItem}
            />
          </div>
        </main>
      </div>
      <CheckoutDialog
        items={checkoutItems}
        show={showCheckoutDialog}
        onSave={saveCheckout}
        onClose={closeCheckoutDialog}
        itemPaidToggled={onItemPaidToggled}
      ></CheckoutDialog>
      <CreateDialog
        show={showCreateDialog}
        onClose={closeCreateDialog}
        onSave={onItemAdded}
      ></CreateDialog>
      {editDialog}
    </>
  );
}

export default App;
