import VoteForm from "@/components/vote/VoteForm";

export default function VotePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Cast Your Vote</h1>
      <VoteForm />
    </div>
  );
}
