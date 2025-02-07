import { StrictMode, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import ReactDOM from "react-dom/client";
import {RouterProvider, createHashRouter, useNavigate,} from "react-router-dom";
import { useAccount, JazzProvider, usePasskeyAuth, PasskeyAuthBasicUI, useCoState} from "jazz-react";
import { ID } from "jazz-tools";
import { AppAccount, ListOfExpenses, Budget } from "./schema";
import { BudgetView } from "./components/budgetView.tsx"
import "./index.css";

const appName = "Subscriptions";

function JazzAndAuth({ children }: { children: React.ReactNode }) {
  const [passkeyAuth, passKeyState] = usePasskeyAuth({ appName });
  return ( 
    <>
      <JazzProvider
          AccountSchema={AppAccount}
          auth={passkeyAuth}
          peer="ws://127.0.0.1:4300/?key=user@localhost"
      >
        {children}
      </JazzProvider>
      <PasskeyAuthBasicUI state={passKeyState} />
    </>
  );
}

declare module "jazz-react" {
  interface Register {
    Account: AppAccount;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render( 
  <StrictMode>
    <div className="select-none flex flex-col w-full h-screen" style={{ backgroundImage: 'url("/assets/bg.jpg")' }}>
      <JazzAndAuth>
        <App />
      </JazzAndAuth>
    </div>
  </StrictMode>,
);

// Helper function to generate a random color class
const getRandomColor = () => {
  const colors = [
    "bg-red-700",
    "bg-green-700",
    "bg-blue-700",
    "bg-yellow-700",
    "bg-purple-700",
    "bg-pink-700",
    "bg-indigo-700",
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

function App() {
  const { me, logOut } = useAccount();
  const router = createHashRouter([
    {
      path: "/",
      element: <Overview/>,
    },
    {
      path: "/new",
      element: <NewBudget/>,
    },
    {
      path: "/budget/:budgetId",
      element: <BudgetDetails/>,
    },
  ]);

  function Overview() {
    const { me } = useAccount();
    const navigate = useNavigate();
  
    const myBudgets = me?.root?.budgets;
  
    const handleDelete = (index:number) => {
      myBudgets?.splice(index,1);
    };
    
    useEffect(() => {
      if (myBudgets?.length === 0) {
        navigate('/new');  // Navigate only if myVariable is undefined
      }
    }, [myBudgets, navigate]);
  
    return (
      <>
        {myBudgets?.length ? (
        <>
          <h1 className="text-white text-5xl ml-10 capitalize">budgets</h1>
          <button className="inline-flex w-40 items-center px-8 py-3 bg-indigo-400 hover:bg-green-500 text-black text-lg font-medium rounded-md m-10" onClick={()=>{navigate("/new")}}>Create New</button>
          <div className="grid gap-14 md:grid-cols-3 md:gap-5">
          {myBudgets.map(
            (budget, index) =>
              budget && (
                <div  key={"entry_"+budget.id} className={getRandomColor()+" bg-opacity-40 m-10 overflow-hidden rounded-lg"}>
                  <div className="relative text-white px-6 pb-6 mt-6">
                    <span className="block opacity-75 -mb-1">Budget</span>
                    <div className="flex justify-between">
                      <span className="block font-semibold text-4xl uppercase">{budget.name}</span>
                    </div>
                  </div>
                  <div className="ml-4 mb-6">
                    <button className="flex-1 m-3 items-center p-3 bg-white bg-opacity-70 hover:bg-green-500 text-black text-lg font-medium rounded-3xl w-40" key={"open_"+budget.id} onClick={()=>{navigate("/budget/" + budget.id)}}>
                      <span className="flex-1">Open</span>
                    </button>
                    <button className="flex-1 m-3 items-center p-3 bg-white bg-opacity-70 hover:bg-red-500 text-black text-lg font-medium rounded-3xl w-40" key={"delete_"+budget.id} onClick={() => handleDelete(index)}>
                      <span className="flex-1">Delete</span>
                    </button>
                  </div>
                </div>
              ),
          )}
          </div>
        </>
      ) : undefined}
      </>
    );
  }

  function NewBudget() {
    const { me } = useAccount();
    const navigate = useNavigate();
  
    const [BudgetID, setBudgetID] = useState<ID<Budget> | undefined>(undefined);
  
    const newBudget = useCoState(Budget, BudgetID);
  
    const onChangeName = useCallback((name: string) => {
        if (!me) return;
        if (newBudget) {
          newBudget.name = name;
        } else {
          const budget = Budget.create({
              name,
              expenses: ListOfExpenses.create([]),
          });
  
          setBudgetID(budget.id);
        }
      },
      [me, newBudget],
    );
  
    const onSubmit = useCallback(() => {
      if (!me || !newBudget) return;
      const myBudgets = me.root?.budgets;
  
      if (!myBudgets) {
        throw new Error("No budgets found");
      }
  
      myBudgets.push(newBudget as Budget);
  
      navigate("/budget/" + newBudget.id);
    }, [me?.root?.budgets, newBudget, navigate]);
  
    return (
      <div className="ml-10">
        <p className="mb-5 text-gray-400 w-full text-3xl font-heavy">Give a name to you new budget</p>
        <input
          type="text"
          placeholder="Budget Name"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-3xl rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-half p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(event) => onChangeName(event.target.value)}
          value={newBudget?.name || ""}
        />
        
        <button className="inline-flex w-half mr-10 items-center px-8 py-3 bg-indigo-400 hover:bg-red-500 text-black text-lg font-medium rounded-md m-0 mt-10" onClick={() => navigate("/")}
        >Back</button>
  
        {newBudget?.name && (
          <button className="inline-flex w-half items-center px-8 py-3 bg-indigo-400 hover:bg-green-500 text-black text-lg font-medium rounded-md m-0 mt-10" onClick={onSubmit}>Create Budget</button>
        )}
      </div>
    );
  }

  return (
    <>      
      <div className="flex flex-between bg-contain bg-center w-screen pt-0 p-5 pt-3" style={{backgroundImage: `url("/assets/bg.jpg")`}}>
        <span className="flex-1 text-white text-5xl ml-4">{me?.profile?.name}</span>
        <button className="mr-1 m-1 items-center p-3 bg-white bg-opacity-50 hover:bg-red-500 text-black w-40 text-lg font-medium"
          onClick={() => router.navigate("/").then(() => logOut())}
        >
          <span className="flex-1">Logout</span>
        </button>
      </div>
      <RouterProvider router={router} />
    </>
  );
}

export function BudgetDetails() {
  const budgetID = useParams<{ budgetId: ID<Budget> }>().budgetId;
  const budget = useCoState(Budget, budgetID);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between">
        <h1 className="text-white text-5xl ml-10 capitalize">{budget?.name}</h1>

        <button className="mr-6 m-1 items-center p-3 bg-white bg-opacity-50 hover:bg-red-500 text-black w-40 text-lg font-medium"
          onClick={() => navigate("/")}
        >
          <span className="flex-1">Back</span>
        </button>
      </div>
      <BudgetView budgetID={budgetID!} />
    </div>
  );
}