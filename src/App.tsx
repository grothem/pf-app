import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Airtable from "airtable";

interface Item {
  id?: string;
  bidNumber: number;
  itemNumber: string;
  itemDescription: string;
  price: number;
  paid: boolean;
}
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.REACT_APP_AIRTABLE_APIKEY,
});

function App() {
  const [items, setItems] = useState<Item[]>([]);

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
  };

  const deleteItem = async (item: Item) => {
    if (!item.id) return;

    const base = Airtable.base("app1gjuCkFPG0GFrC");
    await base.table("Table 1").destroy([item.id]);
    setItems((items) => items.filter((i) => i.id !== item.id));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <Create onAdd={onItemAdded}></Create>
        {items.map((item) => (
          <div key={item.id}>
            <p>
              {item.bidNumber} - {item.itemNumber} - {item.itemDescription}
            </p>
            <p>{item.price}</p>
            <p>{item.paid ? "paid" : "not paid"}</p>
            <button onClick={() => deleteItem(item)}>Delete</button>
          </div>
        ))}
      </header>
    </div>
  );
}

type CreateItem = Omit<Item, "id" | "paid">;
interface CreateProps {
  onAdd: (item: CreateItem) => void;
}

const Create: React.FC<CreateProps> = (props) => {
  const [bidNumber, setBidNumber] = useState<number>(0);
  const [itemNumber, setItemNumber] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [price, setPrice] = useState<number>(0);

  return (
    <div>
      <input
        type="number"
        placeholder="Bid Number"
        onChange={(e) => setBidNumber(Number(e.target.value))}
      />
      <input
        type="text"
        placeholder="Item Number"
        onChange={(e) => setItemNumber(e.target.value)}
      />
      <input
        type="text"
        placeholder="Item Description"
        onChange={(e) => setItemDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        onChange={(e) => setPrice(Number(e.target.value))}
      />
      <button
        onClick={() =>
          props.onAdd({
            bidNumber,
            itemNumber,
            itemDescription,
            price,
          })
        }
      >
        Add
      </button>
    </div>
  );
};

export default App;
