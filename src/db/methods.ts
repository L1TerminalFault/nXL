import { Transaction } from "./model";

export type TransactionType = {
  _id?: string;
  transaction: string;
  users: string[];
};

export type TransactionParsedType = Omit<TransactionType, "transaction"> & {
  transaction: {
    amountCredited: string;
    amountCreditedWithCurrency: string;
    amountDebited: string;
    amountDebitedWithCurrency: string;
    authDate: string;
    chargeCode: string;
    chargeComDisplay: string;
    commissionCode: string;
    creditAccountHolder: string;
    creditAccountNo: string;
    creditCurrency: string;
    creditTheirRef: string;
    creditValueDate: string;
    currNo: string;
    currencyMktDr: string;
    dateTimes: string[];
    debitAccountHolder: string;
    debitAccountNo: string;
    debitAmount: string;
    debitCurrency: string;
    debitTheirRef: string;
    debitValueDate: string;
    encodedReceipt: string;
    id: string;
    paymentDetails: string[];
    positionType: string;
    processingDate: string;
    rateFixing: string;
    roundType: string;
    totRecChg: string;
    totRecChgLcl: string;
    totRecComm: string;
    totRecCommLcl: string;
    totalChargeAmount: string;
    totalChargeAmountWithCurrency: string;
    totalTaxAmount: string;
    totalTaxAmountWithCurrency: string;
    transactionType: string;
    url: string;
  };
};

export const addTransaction = async (transaction: string) => {
  const transactionObj = new Transaction({ transaction, users: [] });
  await transactionObj.save();
};

export const updateTransaction = async ({
  _id,
  transaction,
  users,
}: TransactionType) => {
  Transaction.findOneAndUpdate({ _id }, { transaction, users });
};

export const getTransactions = async (user?: string) => {
  if (!user) return Transaction.find({}).sort({ _id: -1 });
  else return Transaction.find({ users: user }).sort({ _id: -1 });
};
