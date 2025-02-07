import { CoList, CoMap, Account, Profile, co } from "jazz-tools";

export const EXPENSE_CATEGORIES = [
  "streaming",
  "groceries",
  "services",
  "utilities",
  "magazines",
  "clubs",
  "classes",
  "other",
] as const;

export class Expense extends CoMap {
  name = co.string; // The name of the service
  cost = co.number; // The monthly cost
  category = co.literal(...EXPENSE_CATEGORIES);
}

export class ListOfExpenses extends CoList.Of(co.ref(Expense)) {}

export class Budget extends CoMap {
    name = co.string;
    expenses = co.ref(ListOfExpenses);
}

export class ListOfBudgets extends CoList.Of(co.ref(Budget)) {}

/** The account root is an app-specific per-user private `CoMap`
 *  where you can store top-level objects for that user */
export class AppAccountRoot extends CoMap {
  budgets = co.ref(ListOfBudgets);
}

export class AppAccount extends Account {
    profile = co.ref(Profile);
    root = co.ref(AppAccountRoot);
  
    /** The account migration is run on account creation and on every log-in.
     *  It is used to set up the account root and any other initial CoValues needed.
     */
    migrate() {
      if (!this._refs.root) {
        this.root = AppAccountRoot.create(
          {
            budgets: ListOfBudgets.create([], { owner: this }),
          },
          { owner: this },
        );
      }
    }
  }