import { ID } from "jazz-tools";
import { Budget, Expense, EXPENSE_CATEGORIES} from "../schema";
import { useCoState } from "jazz-react";
import { DonutChartComponent } from "./donutChart";

export function BudgetView({ budgetID }: { budgetID: ID<Budget> }) {
    const budget = useCoState(Budget, budgetID, { expenses: [{}]});
    const createAndAddExpense = () => {
        budget?.expenses?.push(Expense.create({
            name: "",
            cost: 1,
            category: "other",
        },  budget._owner));
    };

    const handleDelete = (index:number) => {
      budget?.expenses?.splice(index,1);
    };
    
    return (
      <>
      <div>
        <div className="p-1 flex flex-wrap items-center justify-center">
        <div className="flex flex-wrap items-center justify-center">
          <DonutChartComponent budgetID={budgetID!} filterType="" size={250} />
        </div>
        <div className="flex flex-wrap items-center justify-center">
          {EXPENSE_CATEGORIES.map((category, index) => (
            <DonutChartComponent key={"chart_sub_"+index} budgetID={budgetID!} filterType={category} size={100} />
          ))}
        </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <button className="mb-5 px-8 py-4 bg-green-800 hover:bg-green-400 text-xl font-medium rounded-md" onClick={createAndAddExpense}>
          Add Expense
        </button>
      </div>
      <div className="p-1 flex flex-wrap items-center justify-center">
        {budget?.expenses?.map((expense, index) => (expense && (
          <div key={expense.id}>
            <div className="flex-shrink-0 m-6 relative overflow-hidden bg-indigo-900 bg-opacity-80 rounded-lg max-w-xl shadow-lg border-4 border-indigo-900">
              <div className="relative pt-4 px-5 flex items-center justify-center">
                <input className="relative text-4xl bg-transparent border-none text-white
                  w-full focus:outline-none" type="text"
                  placeholder="Name"
                  value={expense.name}
                  onChange={(event) => { expense.name = event.target.value }}
                />
              </div>
              <div className="relative text-white  bg-black pt-7 bg-opacity-20 px-5 pb-6 mt-6">
                <div className="flex justify-between">
                  <input type="number" className="block bg-indigo-100 rounded-full text-black text-lg font-bold px-4 w-40 text-right"
                          value={expense.cost}
                          onChange={(event) => { expense.cost = Number(event.target.value) }}
                  />
                  <select className="border border-gray-100 text-gray-900 text-lg rounded-full block w-half p-2.5"
                          value={expense.category}
                          onChange={(event) => {
                          if (EXPENSE_CATEGORIES.includes(event.target.value as any)) {
                            expense.category = event.target.value as  typeof EXPENSE_CATEGORIES[number];
                          }
                      }}
                  >
                    {EXPENSE_CATEGORIES.map((category, index) => (
                      <option key={index} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button className="inline-flex items-center px-8 py-4 bg-indigo-400 hover:bg-red-500 text-black text-lg font-medium rounded-md"  onClick={() => handleDelete(index)}>delete</button>
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>
      </>
    );
}