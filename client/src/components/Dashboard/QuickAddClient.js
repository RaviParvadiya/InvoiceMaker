/* eslint-disable no-useless-escape */
import React, { useState, useCallback, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Button from "../Button/Button";
import SectionTitle from "../Common/SectionTitle";
import { useAppContext } from "../../context/AppContext";
import {
  defaultInputStyle,
  defaultInputInvalidStyle,
  defaultInputLargeStyle,
  defaultInputLargeInvalidStyle,
  defaultSkeletonLargeStyle,
  defaultSkeletonNormalStyle,
} from "../../constants/defaultStyles";
import {
  addNewClient,
  getClientNewForm,
  updateNewClientFormField,
} from "../../store/clientSlice";
import { createUser } from "../../api/baseUrl";

const emptyForm = {
  _id: "",
  accountno: "",
  name: "",
  mobileno: "",
};

function QuickAddClient({ editForm }) {
  const dispatch = useDispatch();
  const clientNewForm = useSelector(getClientNewForm);
  const { initLoading: isInitLoading } = useAppContext();

  const initialIdCounter = parseInt(localStorage.getItem("idCounter")) || 1;
  const [idCounter, setIdCounter] = useState(initialIdCounter);
  const [isTouched, setIsTouched] = useState(false);
  const [clientForm, setClientForm] = useState(emptyForm);
  const [validForm, setValidForm] = useState(
    Object.keys(emptyForm).reduce((a, b) => {
      return { ...a, [b]: false };
    }, {})
  );

  const handlerClientValue = useCallback(
    (event, keyName) => {
      const value = event.target.value;

      setClientForm((prev) => {
        return { ...prev, [keyName]: value };
      });

      dispatch(updateNewClientFormField({ key: keyName, value }));
    },
    [dispatch]
  );

  const submitHandler = useCallback(() => {
    setIsTouched(true);

    const isValid = Object.keys(validForm).every((key) => validForm[key]);

    if (!isValid) {
      toast.error("Invalid Client Form!", {
        position: "bottom-center",
        autoClose: 2000,
      });
      return;
    }

    const newData = { ...clientForm, accountno: idCounter };
    createUser(newData)
      .then((response) => {
        console.log("User created successfully:", response.data);
        dispatch(addNewClient({...response.data}));
        toast.success("Wow so easy to Create!", {
          position: "bottom-center",
          autoClose: 2000,
        });
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });

    setIsTouched(false);
    setIdCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      localStorage.setItem("idCounter", newCounter);
      return newCounter;
    });
  }, [clientForm, validForm, idCounter, dispatch]);

  useEffect(() => {
    setValidForm(() => ({
      _id: true,
      name: clientForm?.name?.trim() ? true : false,
      mobileno: clientForm?.mobileno?.trim() ? true : false,
    }));
  }, [clientForm]);

  useEffect(() => {
    if (clientNewForm) {
      setClientForm(clientNewForm);
    }
  }, [clientNewForm]);

  return (
    <div className="bg-white rounded-xl p-4">
      <SectionTitle> Quick Add Client </SectionTitle>
      <div className="flex mt-2">
        <div className="flex-1">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonLargeStyle} />
          ) : (
            <div>
              <input
                autoComplete="nope"
                value={clientForm.name}
                placeholder="Name"
                className={
                  !validForm.name && isTouched
                    ? defaultInputLargeInvalidStyle
                    : defaultInputLargeStyle
                }
                onChange={(e) => handlerClientValue(e, "name")}
                disabled={isInitLoading}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex mt-2">
        <div className="flex-1">
          {isInitLoading ? (
            <Skeleton className={defaultSkeletonNormalStyle} />
          ) : (
            <input
              autoComplete="nope"
              placeholder="Mobile No"
              className={
                !validForm.mobileno && isTouched
                  ? defaultInputInvalidStyle
                  : defaultInputStyle
              }
              disabled={isInitLoading}
              value={clientForm.mobileno}
              onChange={(e) => handlerClientValue(e, "mobileno")}
            />
          )}
        </div>
      </div>
      <div className="mt-3">
        <Button onClick={submitHandler} block={1}>
          <span className="inline-block ml-2"> Submit </span>
        </Button>
      </div>
    </div>
  );
}

export default QuickAddClient;
