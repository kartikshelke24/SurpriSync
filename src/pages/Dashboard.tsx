import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Share2, Users, BarChart3, Trash2, ArrowRight } from "lucide-react";
import { getAllSurprises, deleteSurprise, occasionMeta, themes } from "@/lib/surprises";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Dashboard = () => {
  const surprises = useMemo(() => getAllSurprises(), []);
  const [localSurprises, setLocalSurprises] = React.useState(surprises);

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this surprise?")) {
      deleteSurprise(id);
      setLocalSurprises(localSurprises.filter((s) => s.id !== id));
      toast.success("Surprise deleted");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-black">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-5xl font-bold text-white mb-2">
              Your Surprises
            </h1>
            <p className="text-lg text-white/70">
              Manage, share, and celebrate all your special moments
            </p>
          </div>
          <Button asChild className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-12 px-6 font-semibold inline-flex items-center gap-2">
            <Link to="/create">
              <Plus className="w-5 h-5" /> Create New
            </Link>
          </Button>
        </div>

        {/* Surprises Grid */}
        {localSurprises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localSurprises.map((surprise) => {
              const meta = occasionMeta[surprise.occasion];
              const isLocked =
                new Date(surprise.revealAt).getTime() > Date.now();

              return (
                <div
                  key={surprise.id}
                  className="glass-dark rounded-3xl overflow-hidden hover:bg-white/10 transition-all group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 border-b border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{meta.emoji}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isLocked
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {isLocked ? "Locked" : "Ready"}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white mb-1">
                      {surprise.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      For <span className="font-semibold">{surprise.toName}</span> from{" "}
                      <span className="font-semibold">{surprise.fromName}</span>
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Quick Info */}
                    <div className="space-y-2 text-sm text-white/70">
                      <p>
                        Created:{" "}
                        <span className="text-white">
                          {new Date(surprise.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                      {isLocked && (
                        <p>
                          Unlocks:{" "}
                          <span className="text-white">
                            {new Date(surprise.revealAt).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Link
                        to={`/s/${surprise.id}/share`}
                        className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold text-white group/btn"
                      >
                        <span className="flex items-center gap-2">
                          <Share2 className="w-4 h-4" /> Share
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </Link>
                      <Link
                        to={`/contribution/${surprise.id}`}
                        className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold text-white group/btn"
                      >
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" /> Wishes
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </Link>
                      <Link
                        to={`/analytics/${surprise.id}`}
                        className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold text-white group/btn"
                      >
                        <span className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" /> Analytics
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      </Link>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(surprise.id)}
                      className="w-full mt-2 px-4 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-sm font-semibold text-red-300 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              No surprises yet
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Create your first surprise and start spreading joy
            </p>
            <Button asChild className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 h-12 px-8 font-semibold">
              <Link to="/create">
                <Plus className="w-5 h-5 mr-2" /> Create a Surprise
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
