import { useCoState } from "jazz-react";
import { ID } from "jazz-tools";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Budget } from "../schema";

const shuffleColors = (colors: any[]) => {
    return colors.sort(() => Math.random() - 0.5);
};

const transformData = (rawData: any[] | undefined, filterType:string) => {
    return rawData?.filter(item => {
        const match = !filterType || item.category?.toLowerCase() === filterType.toLowerCase();
        return match;
    }).map(item => ({
        name: item.name.length > 0 ? item.name : "N/A",
        value: item.cost
    }));
};

const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE",
    "#34A853", "#FBBC05", "#EA4335", "#4285F4", "#E37400",
    "#B3B3B3", "#6A0DAD", "#FF69B4", "#CDDC39", "#795548"
];

const randomizedColors = shuffleColors([...COLORS]);

export function DonutChartComponent({ budgetID, size, filterType}: { budgetID: ID<Budget>, size: number, filterType: any}) {
    const budget = useCoState(Budget, budgetID, { expenses: [{}]});
    const data = transformData(budget?.expenses, filterType);

    const totalSum = data?.reduce((sum, item) => sum + item.value, 0);

    return data && data.length > 0 ? (
        <div className="columns-1 align-center p-10 ml-12 items-top">
            <PieChart width={size*2 + 6} height={size*2+100}>
                <Pie
                    data={data}
                    cx={size}
                    cy={size}
                    innerRadius={size/1.5}
                    outerRadius={size}
                    dataKey="value"
                >
                {data?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={randomizedColors[index % randomizedColors.length]} />
                ))}
                </Pie>
                <Tooltip />
                 <Legend />
            </PieChart>
            <div className="p-1 flex flex-wrap items-center justify-center text-white text-lg">
                <p className="w-half uppercase block px-4 py-2 bg-indigo-300 bg-opacity-20 ">{filterType ? filterType : "Total"}</p>
                <p className="w-half uppercase block px-4 py-2 bg-indigo-300 bg-opacity-20 ">{totalSum}</p>
            </div>
        </div>
    ) : (<></>);
};
