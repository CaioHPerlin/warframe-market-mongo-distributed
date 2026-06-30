import type { Transaction } from "@warframe/shared";
type TransactionDoc = Omit<Transaction, "_id">;
export declare class TransactionsRepository {
    find(filter: Record<string, unknown>): Promise<Transaction[]>;
    insert(doc: TransactionDoc): Promise<Transaction>;
}
export {};
//# sourceMappingURL=transactions.repository.d.ts.map