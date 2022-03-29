import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { CreateItem } from "./models";
import CurrencyInput from 'react-currency-masked-input'

export interface CreateDialogProps {
  show: boolean;
  onSave: (item: CreateItem) => void;
  onClose: () => void;
}
export const CreateDialog: React.FC<CreateDialogProps> = (props) => {
  const [bidNumber, setBidNumber] = useState<number>();
  const [itemNumber, setItemNumber] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [price, setPrice] = useState<number>();
  const [paid, setPaid] = useState<boolean>(false);

  const onSaveClick = () => {
    props.onSave({
      bidNumber,
      itemNumber,
      itemDescription,
      price,
      paid,
    });
  };
  const inputClass =
    "lg:flex items-center text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:highlight-white/5";

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
                Add New Item
              </Dialog.Title>
              <div className="mt-2">
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
                <input
                  className={inputClass}
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
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
