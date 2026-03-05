import SwipeDeck from "@/src/components/SwipeDeck";

export default function IntentsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start pt-24 pb-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Intent Feed</h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Swipe right to execute an action, swipe left to dismiss.
        </p>
      </div>
      <SwipeDeck />
    </main>
  );
}
