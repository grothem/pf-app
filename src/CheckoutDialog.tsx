import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Item } from "./models";

export interface CheckoutProps {
  items: Item[];
  show: boolean;
  itemPaidToggled: (id: string, paid: boolean) => void;
  onSave: () => void;
  onClose: () => void;
}

export const CheckoutDialog: React.FC<CheckoutProps> = (props) => {
  const onSaveClick = () => {
    props.onSave();
  };

  let noItemsView = <></>;
  if (props.items.length === 0) {
    noItemsView = (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold">No items to checkout</h1>
        </div>
      </div>
    );
  }

  const totalDue = props.items.reduce((acc, item) => {
    let itemPrice = item.price ?? 0;
    const price = item.paid ? 0 : itemPrice;
    return acc + price;
  }, 0);

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
                Checkout
              </Dialog.Title>
              <div className="mt-2">
                {noItemsView}
                {
                  <div className="flex flex-col gap-2">
                    {props.items.map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.paid}
                            onChange={(e) => {
                              props.itemPaidToggled(item.id, e.target.checked);
                            }}
                          />
                          <div>{item.itemNumber}</div>
                          <div>{item.itemDescription}</div>
                          <div className="ml-auto">${item.price}</div>
                        </div>
                      </div>
                    ))}
                    <div className="py-2">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="ml-auto">total due: ${totalDue}</div>
                  </div>
                }
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
