import { TransactionParsedType } from "@/db/methods";

const MOCK_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Health",
];
const MOCK_BANKS = ["CBE", "TeleBirr"];
const MOCK_REASONS = [
  "Dinner",
  "Taxi to work",
  "Movie ticket",
  "Electricity bill",
  "Groceries",
  "Pharmacy",
];
const CURRENT_DATE = Date.now();

// Generate 40 random transactions
export const getMockTransactions = (): TransactionParsedType[] => {
  const transactions: TransactionParsedType[] = [];

  for (let i = 0; i < 40; i++) {
    const isCredit = Math.random() > 0.5;
    // Random date from now to up to 450 days ago (roughly 1y 3m)
    const randomDaysAgo = Math.floor(Math.random() * 450);
    const date = new Date(
      CURRENT_DATE - randomDaysAgo * 24 * 60 * 60 * 1000,
    ).toISOString();

    // Choose random bank if needed, though they aren't parsed back from the store exactly right now,
    // they don't map to a strict field in TransactionParsedType but we simulate normal rows.

    transactions.push({
      _id: `mock_txn_${i}`,
      users: ["user_mock"],
      transaction: {
        payerAcc: isCredit ? "Company Ltd." : "jemal",
        payerAccNo: isCredit ? "1000***456" : "1000***123",
        recieverAcc: isCredit ? "jemal" : "Supermarket",
        recieverAccNo: isCredit ? "1000***123" : "1000***789",
        reason: MOCK_REASONS[Math.floor(Math.random() * MOCK_REASONS.length)],
        amount: (Math.random() * 5000 + 100).toFixed(2),
        date: date,
        url: "/receipt",
        category:
          MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)],
        bank: MOCK_BANKS[Math.floor(Math.random() * MOCK_BANKS.length)],
        remaining: "",

	parsed: true,
      },
    });
  }

  // Sort with most recent first
  return transactions.sort(
    (a, b) =>
      new Date(b.transaction.date).getTime() -
      new Date(a.transaction.date).getTime(),
  );
};
