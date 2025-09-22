import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";
import { useState } from "react";

export default function AwardReportPage() {
  const { awardId } = useParams();
  const qc = useQueryClient();
  const { data: award } = useQuery(["award", awardId], () =>
    apiRequest("GET", `/api/awards/${awardId}`).then((r) => r.data)
  );
  const cashInMut = useMutation(() => apiRequest("POST", `/api/awards/${awardId}/cash-in`), {
    onSuccess: () => qc.invalidateQueries(["award", awardId]),
  });

  const shareMut = useMutation((body: any) => apiRequest("POST", `/api/awards/${awardId}/share`, body));
  const [shareTitle, setShareTitle] = useState(award?.share?.title || "");
  const [shareDesc, setShareDesc] = useState(award?.share?.description || "");

  if (!award) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{award.activity.name}</h1>
      <p className="mb-4">Tokens spent: {award.tokensSpent}</p>
      <h2 className="font-semibold mb-2">Questions answered correctly</h2>
      <ul className="list-disc ml-6 mb-4">
        {award.correctQuestions.map((q: any, idx: number) => (
          <li key={idx}>{q}</li>
        ))}
      </ul>
      {award.status === "UNREDEEMED" && (
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => cashInMut.mutate()}>
          Mark as Cashed In
        </button>
      )}

      <div className="mt-8 border-t pt-4">
        <h3 className="font-semibold mb-2">Share Publicly</h3>
        <label className="block mb-1">Title</label>
        <input value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} className="border p-1 w-full mb-2" />
        <label className="block mb-1">Description</label>
        <textarea value={shareDesc} onChange={(e) => setShareDesc(e.target.value)} className="border p-1 w-full mb-2" />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => shareMut.mutate({ active: !award.share?.isActive, title: shareTitle, description: shareDesc })}
        >
          {award.share?.isActive ? "Disable Share" : "Enable Share"}
        </button>
        {award.share?.isActive && (
          <p className="mt-2 text-sm">Public URL: <a className="text-blue-700 underline" href={award.shareUrl} target="_blank" rel="noreferrer">{award.shareUrl}</a></p>
        )}
      </div>
    </div>
  );
}
