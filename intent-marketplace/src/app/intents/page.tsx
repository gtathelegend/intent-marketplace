import SwipeDeck from "@/src/components/SwipeDeck";
import EventSubmit from "@/src/components/EventSubmit";

export default function IntentsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start pt-24 pb-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Intent Feed</h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Submit an event below and watch your intent card appear in real time.
        </p>
      </div>
      <EventSubmit />
      <SwipeDeck />
    </main>
  );
}
