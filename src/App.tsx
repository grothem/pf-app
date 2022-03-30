import React, { Fragment, useEffect, useMemo, useState } from "react";
import "./App.css";
import Airtable from "airtable";
import { CreateItem, Item } from "./models";
import { EditDialog } from "./EditDialog";
import { Table } from "./Table";
import { CreateDialog } from "./CreateDialog";
import { CheckoutDialog } from "./CheckoutDialog";
import CurrencyFormat from "react-currency-format";
import { Dialog, Transition } from "@headlessui/react";

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
      checked={value ?? false}
      disabled={true}
    />
  );
};

const PriceCell = ({ value }: any) => {
  if (value === undefined) {
    return <></>;
  }

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
      const result = await base.table("Table 1").replace(updates);
      console.log(result);
      const existingItems = [...items];
      for (let i = 0; i < existingItems.length; i++) {
        for (let j = 0; j < editItems.length; j++) {
          if (existingItems[i].id === editItems[j].id) {
            existingItems[i] = editItems[j];
            break;
          }
        }
      }

      const sorted = existingItems.sort((a, b) => {
        if (+a.itemNumber > +b.itemNumber) {
          return 1;
        }
        if (+a.itemNumber < +b.itemNumber) {
          return -1;
        }
        return 0;
      });

      setItems(sorted);
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

  const [itemForDelete, setItemForDelete] = useState<Item>();
  const setDeleteItem = (item: Item) => {
    if (!item.id) return;
    setItemForDelete(item);
  };

  const onConfirmDelete = async () => {
    if (!itemForDelete) return;

    const base = Airtable.base("app1gjuCkFPG0GFrC");
    await base.table("Table 1").destroy([itemForDelete.id]);
    setItems((items) => items.filter((i) => i.id !== itemForDelete.id));
    setItemForDelete(undefined);
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
              onDelete={setDeleteItem}
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

      <Transition appear show={itemForDelete !== undefined} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setItemForDelete(undefined)}
        >
          <div className="min-h-screen px-4 text-center backdrop-blur-sm">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all bg-gray-100 transform shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                  Delete?
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm leading-5 text-gray-500">
                    Are you sure you want to delete this item?
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="group inline-flex items-center h-9 rounded-full text-sm font-semibold whitespace-nowrap px-3 focus:outline-none focus:ring-2 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:hover:text-white dark:focus:ring-slate-500"
                    onClick={onConfirmDelete}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default App;
