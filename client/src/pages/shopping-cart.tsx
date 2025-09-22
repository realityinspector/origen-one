import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiRequest } from "../utils/api";

interface Activity {
  id: number;
  name: string;
  description: string;
  cost: number;
}

export default function ShoppingCartPage() {
  const queryClient = useQueryClient();
  const { data: activities } = useQuery<Activity[]>(["/api/activities"], () =>
    apiRequest("GET", "/api/activities").then((r) => r.data)
  );
  const { data: balance } = useQuery<number>(["/api/points"], () =>
    apiRequest("GET", "/api/points").then((r) => r.data.balance)
  );

  const [allocations, setAllocations] = useState<Record<number, number>>({});
  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0);

  const allocMutation = useMutation(
    (body: any) => apiRequest("POST", "/api/awards/allocate", body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["/api/points"]);
        setAllocations({});
        alert("Tokens redeemed!");
      },
    }
  );

  function updateAlloc(id: number, delta: number) {
    setAllocations((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Redeem Tokens</h1>
      <p className="mb-2">Current tokens: {balance ?? "..."}</p>
      {activities?.map((a) => (
        <div key={a.id} className="border p-3 mb-2 rounded">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{a.name}</h2>
              <p className="text-sm text-gray-600">{a.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => updateAlloc(a.id, -1)}
              >
                -
              </button>
              <span>{allocations[a.id] || 0}</span>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => updateAlloc(a.id, 1)}
              >
                +
              </button>
              <span className="ml-4">Cost: {a.cost}</span>
            </div>
          </div>
        </div>
      ))}
      <button
        disabled={totalAllocated === 0}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={() => allocMutation.mutate({ allocations: Object.entries(allocations).map(([id, tokens]) => ({ activityId: Number(id), tokens })) })}
      >
        Redeem {totalAllocated} tokens
      </button>
    </div>
  );
}
