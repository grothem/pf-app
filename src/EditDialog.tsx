import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Item } from "./models";
import CurrencyFormat from "react-currency-format";
import { inputClass } from "./App";

interface EditProps {
  item: Item;
  show: boolean;
  onSave: (item: Item) => void;
  onClose: () => void;
}
export const EditDialog: React.FC<EditProps> = (props) => {
  const item = props.item;
  const [bidNumber, setBidNumber] = useState<number | undefined>(
    item.bidNumber
  );
  const [itemNumber, setItemNumber] = useState<string>(item.itemNumber);
  const [itemDescription, setItemDescription] = useState<string>(
    item.itemDescription
  );
  const [price, setPrice] = useState<number | undefined>(item.price);
  const [paid, setPaid] = useState<boolean>(item.paid);

  const onSaveClick = () => {
    props.onSave({
      id: item.id,
      bidNumber,
      itemNumber,
      itemDescription,
      price,
      paid,
    });
  };

  return (
    <Transition appear show={props.show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={props.onClose}
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
                Edit Item
              </Dialog.Title>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  className={inputClass}
                  placeholder="Bid Number"
                  value={bidNumber}
                  onChange={(e) => setBidNumber(Number(e.target.value))}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Item Number"
                  value={itemNumber}
                  onChange={(e) => setItemNumber(e.target.value)}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Item Description"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                />
                <CurrencyFormat
                  className={inputClass}
                  placeholder="Price"
                  value={price}
                  displayType={"input"}
                  thousandSeparator={true}
                  prefix={"$"}
                  decimalScale={2}
                  onValueChange={(values) => {
                    const { value } = values;
                    setPrice(+value);
                  }}
                />
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={paid}
                      onChange={() => setPaid(!paid)}
                    />
                    <span className="ml-2 text-sm leading-5 font-medium text-gray-700">
                      Paid
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="group inline-flex items-center h-9 rounded-full text-sm font-semibold whitespace-nowrap px-3 focus:outline-none focus:ring-2 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 focus:ring-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:hover:text-white dark:focus:ring-slate-500"
                  onClick={onSaveClick}
                >
                  Save
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
