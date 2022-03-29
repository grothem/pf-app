import React, { Fragment, useEffect, useMemo, useState } from "react";
import "./App.css";
import Airtable from "airtable";
import { CreateItem, Item } from "./models";
import { EditDialog } from "./EditDialog";
import { Table } from "./Table";
import { CreateDialog } from "./CreateDialog";
import { CheckoutDialog } from "./CheckoutDialog";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.REACT_APP_AIRTABLE_APIKEY,
});

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
          },
          {
            Header: "Price",
            accessor: "price",
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
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="">
            <button onClick={onAddNewItem}>+</button>
            <div>
              <input
                value={checkoutBidder}
                onChange={(e) => setCheckoutBidder(Number(e.target.value))}
              />
              <button onClick={onCheckout}>checkout</button>
            </div>
            <h1 className="text-xl font-semibold">
              React Table + Tailwind CSS = ❤
            </h1>
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
