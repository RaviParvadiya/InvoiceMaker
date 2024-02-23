import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format, parse } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import NumberFormat from "react-number-format";
import { toast } from "react-toastify";
import domtoimage from "dom-to-image";
import InvoiceTopBar from "../../components/Invoice/InvoiceTopBar";
import {
  getAllInvoiceDetailSelector,
  getInvoiceNewForm,
  getIsConfirm,
  setConfirmModalOpen,
  setIsConfirm,
  setNewInvoices,
  updateExisitingInvoiceForm,
  updateNewInvoiceForm,
} from "../../store/invoiceSlice";
import { defaultInputSmStyle, IconStyle } from "../../constants/defaultStyles";
import Button from "../../components/Button/Button";
import PlusCircleIcon from "../../components/Icons/PlusCircleIcon";
import DeleteIcon from "../../components/Icons/DeleteIcon";
import { useAppContext } from "../../context/AppContext";
import SecurityIcon from "../../components/Icons/SecurityIcon";
import { sumProductTotal, sumTotalAmount } from "../../utils/match";
import PageTitle from "../../components/Common/PageTitle";
import { nanoid } from "@reduxjs/toolkit";
import imageData from "../../shared/imageData.json";
import { createInvoice, updateInvoice } from "../../api/baseUrl";

function InvoiceDetailScreen(props) {
  const { initLoading, showNavbar, toggleNavbar, setEscapeOverflow } =
    useAppContext();
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const componentRef = useRef(null);
  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: "Invoice Letter",
    onAfterPrint: useCallback(() => {
      setIsExporting(false);
      setEscapeOverflow(false);
    }, [setEscapeOverflow]),
    removeAfterPrint: true,
  });

  const invoiceNewForm = useSelector(getInvoiceNewForm);
  const allInvoiceDetails = useSelector(getAllInvoiceDetailSelector);
  const isConfirm = useSelector(getIsConfirm);

  const [invoiceForm, setInvoiceForm] = useState(null);

  // Initialize selectedDates with the same length as products array
  // const [selectedDates, setSelectedDates] = useState(new Array(invoiceForm.products.length).fill(null));
  // const [initialDates, setInitialDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const [isViewMode, setIsViewMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statusData, setStatusData] = useState({
    statusName: "Draft",
    statusIndex: 1,
  });

  // const formattedDate = format(selectedDate, "dd/MM/yyyy");
  const fixedBackground = imageData.base64;
  const allowedColor = "#686de0";

  const inlineStyle = {
    backgroundImage: `url(${fixedBackground})`,
    backgroundColor: allowedColor,
  };

  const handleExport = useCallback(() => {
    if (showNavbar) {
      toggleNavbar();
    }
    setEscapeOverflow(true);
    setIsViewMode(true);
    setIsExporting(true);
    setTimeout(() => {
      handlePrint();
    }, 3000);
  }, [handlePrint, setEscapeOverflow, showNavbar, toggleNavbar]);

  const handleDownloadImg = useCallback(() => {
    if (showNavbar) {
      toggleNavbar();
    }
    setEscapeOverflow(true);
    setIsViewMode(true);
    setIsExporting(true);
    domtoimage
      .toJpeg(componentRef.current, { quality: 1 })
      .then(async (dataUrl) => {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          let a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "invoice.jpeg";
          a.hidden = true;
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch (e) {
          console.log(e);
        } finally {
          setIsExporting(false);
          setEscapeOverflow(false);
        }
      });
  }, [setEscapeOverflow, showNavbar, toggleNavbar]);

  const toggleViewMode = useCallback(() => {
    if (invoiceForm.statusIndex !== 1 && isViewMode) {
      toast.warn("You can only edit on Draft Mode", {
        position: "bottom-center",
        autoClose: 3000,
      });
      return;
    }
    setIsViewMode((prev) => !prev);
  }, [invoiceForm, isViewMode]);

  const addEmptyProduct = useCallback(() => {
    const emptyProduct = {
      _id: nanoid(),
      date: "",
      amount: "",
      quantity: "",
    };

    setInvoiceForm((prev) => {
      let updatedData = { ...prev };
      // Ensure that prev.products is initialized as an array
      const currentProducts = Array.isArray(prev.products) ? prev.products : [];
      const updateProducts = [...currentProducts, emptyProduct];

      // Update the products array
      updatedData.products = updateProducts;

      // Update the totalAmount
      updatedData.totalAmount = sumTotalAmount(updateProducts);

      return updatedData;
    });
  }, []);

  const onDeleteProduct = useCallback((prodID) => {
    setInvoiceForm((prev) => {
      let updatedData = { ...prev };
      const updateProducts = prev.products.filter(
        (prod) => prod._id !== prodID
      );
      updatedData.products = updateProducts;
      updatedData.totalAmount = sumTotalAmount(updateProducts);
      return updatedData;
    });
  }, []);

  const handlerInvoiceValue = useCallback((event, keyName) => {
    const value =
      typeof event === "string" ? new Date(event) : event?.target?.value;

    setInvoiceForm((prev) => {
      return { ...prev, [keyName]: value };
    });
  }, []);

  const handlerProductValue = useCallback(
    (event, keyName, productID) => {
      const value = event.target.value;

      // If Keyname Price or Quantity must be only number
      if (keyName === "quantity") {
        if (!`${value}`.match(/^\d+$/)) {
          return;
        }
      }

      if (keyName === "amount") {
        if (!`${value}`.match(/^[0-9]\d*(\.\d+)?$/)) {
          return;
        }
      }

      // Quantity Zero Case
      if ((keyName === "quantity" || keyName === "amount") && value <= 0) {
        return;
      }

      let updatedData = { ...invoiceForm };
      let updateProducts = [...invoiceForm.products];

      const isFindIndex = updateProducts.findIndex(
        (prod) => prod._id === productID
      );
      if (isFindIndex !== -1) {
        updateProducts[isFindIndex] = {
          ...updateProducts[isFindIndex],
          [keyName]: value,
        };

        updatedData.products = [...updateProducts];
      }

      if (keyName === "quantity" || keyName === "amount") {
        updatedData.totalAmount = sumTotalAmount(updateProducts);
      }
      setInvoiceForm(updatedData);
    },
    [invoiceForm]
  );

  const handleProductDateChange = (date, index) => {
    setInvoiceForm((prev) => {
      const updatedData = { ...prev };
      const updatedProducts = [...prev.products];
      updatedProducts[index] = {
        ...updatedProducts[index],
        date: format(date, "dd/MM/yyyy"),
      };
      updatedData.products = updatedProducts;
      return updatedData;
    });

    setSelectedDates((prev) => {
      const updatedDates = [...prev];
      updatedDates[index] = date;
      return updatedDates;
    });
  };

  // Calculation for Showing
  const subTotal = useMemo(() => {
    if (!invoiceForm) {
      return 0;
    }

    if (!invoiceForm?.products) {
      return 0;
    }
    return sumProductTotal(invoiceForm.products);
  }, [invoiceForm]);

  const saveAs = useCallback(
    (status) => {
      setStatusData({
        statusIndex: 1,
        statusName: "Draft",
      });
      dispatch(setConfirmModalOpen(true));
    },
    [dispatch]
  );

  const goInvoiceList = useCallback(() => {
    navigate("/invoices");
  }, [navigate]);

  useEffect(() => {
    if (initLoading === false) {
      if (params.id === "new" && invoiceForm === null) {
        // If New I ignore Company Data,
        // Everytime we set current company Data
        setInvoiceForm({
          ...invoiceNewForm,
          createdDate: new Date(),
        });
      } else if (params.id !== "new" && invoiceForm === null) {
        const getInvoiceDetail = allInvoiceDetails.find(
          (inv) => inv._id === params.id
        );

        if (!getInvoiceDetail) {
          navigate("/invoices");
          return;
        } else {
          setInvoiceForm({
            ...getInvoiceDetail,
            createdDate: new Date(getInvoiceDetail.createdDate),
          });

          setIsViewMode(true);
        }
      }

      // Extract dates from products and store them in initialDates
      /* const dates = invoiceForm?.products?.map((product) => product.date) || [];
    setInitialDates(dates); */
    }
  }, [
    params,
    invoiceForm,
    navigate,
    invoiceNewForm,
    initLoading,
    dispatch,
    allInvoiceDetails,
  ]);

  useEffect(() => {
    if (params.id === "new" && invoiceForm !== null) {
      dispatch(updateNewInvoiceForm(invoiceForm));
    } else if (params.id !== "new" && invoiceForm !== null) {
      dispatch(updateExisitingInvoiceForm(invoiceForm));
    }
  }, [dispatch, invoiceForm, params]);

  useEffect(() => {
    if (initLoading === false) {
      setInvoiceForm((prev) => ({
        ...prev,
      }));
    }
  }, [initLoading]);

  // On Confirm Dependencies
  useEffect(() => {
    if (isConfirm) {
      const isNew = params.id === "new";
      if (isNew) {
        const newData = {
          invoiceName: invoiceForm.invoiceName,
          products: [...invoiceForm.products],
          totalAmount: invoiceForm.totalAmount,
        };
        createInvoice(newData)
          .then((response) => {
            console.log("Invoice created successfully", response.data);
            dispatch(setIsConfirm(false));
            dispatch(
              setNewInvoices({
                ...invoiceForm,
                ...statusData,
                _id: response.data._id,
              })
            );
            setInvoiceForm({
              ...invoiceForm,
              products: [
                {
                  _id: nanoid(),
                  amount: 1,
                  date: "",
                  quantity: 1,
                },
              ],
              totalAmount: 1,
            });
            setTimeout(() => {
              navigate("/invoices");
            }, 300);
          })
          .catch((error) => {
            console.log("Error creating Invoice", error);
          });
      } else {
        // Update Existing Invoice
        updateInvoice(params.id, invoiceForm)
          .then((response) => {
            console.log("Invoice Updated Successfully", response.data);
            dispatch(setIsConfirm(false));
            setIsViewMode(true);
            setInvoiceForm({
              ...invoiceForm,
              ...statusData,
            });
          })
          .catch((error) => {
            console.log("Error updating Invoice", error);
          });
      }
    }
  }, [
    dispatch,
    isConfirm,
    navigate,
    params,
    statusData,
    invoiceForm,
    isViewMode,
  ]);

  return (
    <div>
      <div className="p-4">
        <PageTitle
          title={
            <>
              {params.id === "new"
                ? "New Invoice"
                : `Invoice Detail ${invoiceForm?.statusName}`}
            </>
          }
        />
      </div>
      <div className="px-4 pb-3">
        <InvoiceTopBar
          onClickBack={goInvoiceList}
          viewMode={isViewMode}
          onClickViewAs={toggleViewMode}
          onClickExport={handleExport}
          onClickDownloadImg={handleDownloadImg}
        />
      </div>

      {invoiceForm && (
        <div
          className={
            isExporting
              ? "bg-white mb-1 pt-1 px-1 "
              : "bg-white mx-4 rounded-xl mb-1"
          }
          id="InvoiceWrapper"
          ref={componentRef}
          style={isExporting ? { width: 1200 } : {}}
        >
          {/* Background Image */}
          <div
            className={
              isExporting
                ? "py-5 px-8 bg-cover bg-center bg-slate-50 rounded-xl flex flex-row justify-between items-center"
                : "py-9 px-8 bg-cover bg-center bg-slate-50 rounded-xl flex flex-col sm:flex-row justify-between items-center"
            }
            style={inlineStyle}
          >
            <div className="text-white font-title font-bold text-5xl mt-5 sm:mt-0">
              Invoice
            </div>
          </div>
          {/* Background Image Finished */}
          {/* Customer Billing Info */}
          <div
            className={
              isExporting
                ? "flex flex-row pt-2 px-8"
                : "flex flex-col sm:flex-row pt-3 px-8"
            }
          >
            <div className="flex-1">
              <div className="flex flex-row justify-between items-center mb-1">
                <div className="font-title flex-1"> INVOICE NAME</div>
                <div className="font-title flex-2 text-right">
                  {!isViewMode ? (
                    <input
                      autoComplete="nope"
                      placeholder="Invoice Name"
                      className={defaultInputSmStyle + " text-right"}
                      value={invoiceForm.invoiceName}
                      onChange={(e) => handlerInvoiceValue(e, "invoiceName")}
                    />
                  ) : (
                    invoiceForm.invoiceName || "-"
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-between items-center mb-1">
                <div className="font-title flex-1"> Creation Date </div>
                <div className="font-title flex-1 text-right">
                  <DatePicker
                    selected={invoiceForm.createdDate}
                    onChange={(date) =>
                      handlerInvoiceValue(date.toISOString(), "createdDate")
                    }
                    disabled={true}
                    className={
                      !isViewMode
                        ? defaultInputSmStyle + " border-gray-300 text-right"
                        : " text-right bg-white"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Customer Billing Info Finished */}

          {/* Products */}
          <div className="py-2 px-4">
            <div
              className={
                isExporting
                  ? "flex rounded-lg w-full flex-row px-4 py-1 text-white"
                  : "hidden sm:flex rounded-lg invisible sm:visible w-full flex-col sm:flex-row px-4 py-2 text-white"
              }
              style={inlineStyle}
            >
              <div
                className={
                  "font-title " +
                  (isExporting
                    ? " text-sm w-1/4 text-right pr-10"
                    : " w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                <span className="inline-block">Date</span>
              </div>
              <div
                className={
                  "font-title " +
                  (isExporting
                    ? " text-sm  w-1/4 text-right pr-10"
                    : " w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                Quantity
              </div>
              <div
                className={
                  "font-title " +
                  (isExporting
                    ? " text-sm  w-1/4 text-right pr-10"
                    : " w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                Price
              </div>

              <div
                className={
                  "font-title" +
                  (isExporting
                    ? " text-sm w-1/4 text-right pr-10"
                    : "  w-full sm:w-1/4 text-right sm:pr-10")
                }
              >
                Total
              </div>
            </div>

            {invoiceForm?.products?.map((product, index) => (
              <div
                key={`${index}_${product._id}`}
                className={
                  (isExporting
                    ? "flex flex-row rounded-lg w-full px-4 py-1 items-center relative text-sm"
                    : "flex flex-col sm:flex-row rounded-lg sm:visible w-full px-4 py-2 items-center relative") +
                  (index % 2 !== 0 ? " bg-gray-50 " : "")
                }
              >
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Date
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full mb-0"
                        : "inline-block w-1/2 sm:w-full mb-1 sm:mb-0"
                    }
                  >
                    {params.id === "new" ? (
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={selectedDates[index]}
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(date) =>
                          handleProductDateChange(date, index)
                        }
                      />
                    ) : !isViewMode ? (
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        selected={
                          selectedDates[index] ||
                          parse(product.date, "dd/MM/yyyy", new Date())
                        }
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(date) =>
                          handleProductDateChange(date, index)
                        }
                      />
                    ) : (
                      <span className="pr-3">{product.date}</span>
                    )}
                  </span>
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Quantity
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full mb-0"
                        : "inline-block w-1/2 sm:w-full mb-1 sm:mb-0"
                    }
                  >
                    {!isViewMode ? (
                      <input
                        autoComplete="nope"
                        value={product.quantity}
                        type={"number"}
                        placeholder="Quantity"
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(e) =>
                          handlerProductValue(e, "quantity", product._id)
                        }
                      />
                    ) : (
                      <span className="pr-3">
                        <NumberFormat
                          value={product.quantity}
                          className=""
                          displayType={"text"}
                          thousandSeparator={true}
                          renderText={(value, props) => (
                            <span {...props}>{value}</span>
                          )}
                        />
                      </span>
                    )}
                  </span>
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-8 flex flex-row block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Price
                    </span>
                  )}
                  <span
                    className={
                      isExporting
                        ? "inline-block w-full mb-0"
                        : "inline-block w-1/2 sm:w-full mb-1 sm:mb-0"
                    }
                  >
                    {!isViewMode ? (
                      <input
                        autoComplete="nope"
                        value={product.amount}
                        placeholder="Price"
                        type={"number"}
                        className={defaultInputSmStyle + " text-right"}
                        onChange={(e) =>
                          handlerProductValue(e, "amount", product._id)
                        }
                      />
                    ) : (
                      <span className="pr-3">
                        <NumberFormat
                          value={product.amount}
                          className=""
                          displayType={"text"}
                          thousandSeparator={true}
                          renderText={(value, props) => (
                            <span {...props}>{value}</span>
                          )}
                        />
                      </span>
                    )}
                  </span>
                </div>

                <div
                  className={
                    isExporting
                      ? "font-title w-1/4 text-right pr-9 flex flex-row `1block"
                      : "font-title w-full sm:w-1/4 text-right sm:pr-9 flex flex-row sm:block"
                  }
                >
                  {!isExporting && (
                    <span className="sm:hidden w-1/2 flex flex-row items-center">
                      Total
                    </span>
                  )}

                  <span
                    className={
                      isExporting
                        ? "inline-block w-full "
                        : "inline-block w-1/2 sm:w-full"
                    }
                  >
                    <NumberFormat
                      value={
                        Number.isInteger(product.quantity * product.amount)
                          ? product.quantity * product.amount
                          : (product.quantity * product.amount)
                              .toFixed(4)
                              .toString()
                              .slice(0, -2)
                      }
                      className=""
                      displayType={"text"}
                      thousandSeparator={true}
                      renderText={(value, props) => (
                        <span {...props}>{value}</span>
                      )}
                    />{" "}
                    {invoiceForm?.currencyUnit}
                  </span>
                </div>
                {!isViewMode && (
                  <div
                    className="w-full sm:w-10 sm:absolute sm:right-0"
                    onClick={() => onDeleteProduct(product._id)}
                  >
                    <div className="w-full text-red-500 font-title h-8 sm:h-8 sm:w-8 cursor-pointer rounded-2xl bg-red-200 mr-2 flex justify-center items-center">
                      <DeleteIcon className="h-4 w-4" style={IconStyle} />
                      <span className="block sm:hidden">Delete Product</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Product Actions */}
            {!isViewMode && (
              <div className="flex flex-col sm:flex-row rounded-lg sm:visible w-full px-4 py-2 items-center sm:justify-end">
                <div className="font-title w-full sm:w-1/4 text-right sm:pr-8 flex flex-row sm:block mb-1">
                  <Button size="sm" block={1} onClick={addEmptyProduct}>
                    <PlusCircleIcon style={IconStyle} className="h-5 w-5" />
                    Add Empty Product
                  </Button>
                </div>
              </div>
            )}
            {/* Add Product Actions Finished*/}

            {/* Subtotal Start */}
            {/* Subtotal Finished */}

            {/* Taxes */}

            {/* Taxes Finished*/}

            {/* Add Tax Action */}

            {/* Add Tax Action Finished*/}

            {/* Total Start */}
            <div
              className={
                isExporting
                  ? "flex flex-row justify-end w-full items-center text-white"
                  : "flex flex-row sm:flex-row sm:justify-end w-full items-center text-white"
              }
            >
              <div
                className={
                  isExporting
                    ? "w-1/2 px-4 py-1 flex flex-row rounded-lg items-center"
                    : "w-full sm:w-1/2 px-4 py-1 flex flex-row rounded-lg items-center"
                }
                style={inlineStyle}
              >
                <div
                  className={
                    isExporting
                      ? "font-title text-base w-1/2 text-right pr-9 flex flex-row block  justify-end items-center"
                      : "font-title text-lg w-1/2 text-right sm:pr-9 flex flex-row sm:block items-center"
                  }
                >
                  Total
                </div>
                <div
                  className={
                    isExporting
                      ? "font-title text-lg w-1/2 text-right pr-9 flex flex-row block  justify-end items-center"
                      : "font-title text-lg w-1/2 text-right sm:pr-9 flex flex-row justify-end sm:block items-center"
                  }
                >
                  <NumberFormat
                    value={subTotal}
                    className=""
                    displayType={"text"}
                    thousandSeparator={true}
                    renderText={(value, props) => (
                      <span {...props}>{value} </span>
                    )}
                  />
                </div>
              </div>
            </div>
            {/* Total Finished */}
          </div>
          {/* Products Finished */}
        </div>
      )}

      {invoiceForm && invoiceForm?.statusIndex !== 3 && (
        <div className="px-4 pt-3">
          <div className="bg-white rounded-xl px-3 py-3">
            <div className="flex flex-col flex-wrap sm:flex-row">
              <div className="w-full flex-1 my-1 sm:my-1 md:my-0 px-1">
                <Button
                  size="sm"
                  block={1}
                  success={1}
                  onClick={() => saveAs("Draft")}
                >
                  <SecurityIcon className="h-5 w-5 mr-1" />{" "}
                  {params.id === "new" ? "Save" : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceDetailScreen;
