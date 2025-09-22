import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";

export default function PublicAwardSharePage() {
  const { username, hash } = useParams();
  const { data, isLoading } = useQuery(["publicShare", username, hash], () =>
    apiRequest("GET", `/users/${username}/award/${hash}`).then((r) => r.data)
  );

  if (isLoading) return <p>Loading...</p>;
  if (!data) return <p>Not found</p>;

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <h1 className="text-3xl font-bold mb-2 text-center">{data.title}</h1>
      <p className="mb-6 text-center text-gray-700">{data.description}</p>

      <div className="border rounded p-4 shadow">
        <h2 className="text-xl font-semibold mb-2">Reward: {data.activity.name}</h2>
        <p className="mb-4">Tokens spent: {data.tokens_spent}</p>
        <h3 className="font-semibold mb-1">How it was earned</h3>
        <ul className="list-disc ml-6">
          {data.correct_questions.map((q: string, idx: number) => (
            <li key={idx}>{q}</li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-sm text-center text-gray-500">Shared by {username}</p>
    </div>
  );
}

