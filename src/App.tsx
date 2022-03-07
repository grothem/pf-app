import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import Airtable from "airtable";

interface Item {
  id: string;
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

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold underline">Hello world!</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React weeeee
        </a>
        {items.map((item) => (
          <div key={item.id}>
            <p>
              {item.bidNumber} - {item.itemNumber} - {item.itemDescription}
            </p>
            <p>{item.price}</p>
            <p>{item.paid ? "paid" : "not paid"}</p>
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;
