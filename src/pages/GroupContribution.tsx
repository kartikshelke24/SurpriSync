import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Copy, Check, Plus, Send, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSurprise,
  getGroupContribution,
  createGroupContribution,
  addContributor,
  getContributorsForSurprise,
  Contributor,
} from "@/lib/surprises";
import { toast } from "sonner";

const GroupContribution = () => {
  const { id } = useParams();
  const surprise = useMemo(() => (id ? getSurprise(id) : undefined), [id]);
  const [contribution, setContribution] = useState(() =>
    id ? getGroupContribution(id) || createGroupContribution(id) : undefined
  );
  const [contributors, setContributors] = useState(() =>
    id ? getContributorsForSurprise(id) : []
  );
  const [copied, setCopied] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  if (!surprise) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-3xl p-10 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-display text-2xl font-semibold">Surprise not found</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </main>
    );
  }

  const copyLink = () => {
    if (contribution?.inviteLink) {
      navigator.clipboard.writeText(contribution.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Invite link copied!");
    }
  };

  const handleAddContributor = (name: string, videoWish: string) => {
    const newContributor: Contributor = {
      id: Math.random().toString(36).slice(2, 9),
      name,
      videoWish,
      addedAt: new Date().toISOString(),
      avatar: name.slice(0, 2).toUpperCase(),
    };
    addContributor(id!, newContributor);
    setContributors([...contributors, newContributor]);
    toast.success(`${name} added to the surprise!`);
    setShowUpload(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
      {/* Background blur */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-2xl text-white">
        {/* Header */}
        <Link
          to={`/s/${id}/share`}
          className="inline-flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to surprise
        </Link>

        {/* Title */}
        <div className="mb-10">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-2">
            Group Wishes
          </h1>
          <p className="text-lg text-white/80">
            Invite friends to add video wishes for {surprise.toName}
          </p>
        </div>

        {/* Invite Link Section */}
        <div className="glass-dark rounded-3xl p-8 mb-8">
          <h2 className="font-display text-2xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6" /> Invite Friends
          </h2>
          <p className="text-white/80 mb-4">
            Share this link with friends to collect video wishes
          </p>
          <div className="flex items-stretch gap-2 rounded-2xl overflow-hidden bg-white/10">
            <input
              type="text"
              value={contribution?.inviteLink || ""}
              readOnly
              className="flex-1 bg-transparent px-4 py-3 text-sm font-mono outline-none"
            />
            <button
              onClick={copyLink}
              className="bg-white text-black px-4 py-3 font-semibold hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Contributors List */}
        <div className="glass-dark rounded-3xl p-8 mb-8">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Video Wishes ({contributors.length})
          </h2>

          {contributors.length > 0 ? (
            <div className="space-y-4 mb-6">
              {contributors.map((contributor) => (
                <div
                  key={contributor.id}
                  className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 grid place-items-center font-semibold text-sm">
                      {contributor.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold">{contributor.name}</h3>
                      <p className="text-xs text-white/60">
                        Added{" "}
                        {new Date(contributor.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {contributor.videoWish && (
                    <div className="mt-3 rounded-lg bg-black/20 aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎥</div>
                        <p className="text-xs text-white/60">Video wish</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-white/60 mb-6">
              <div className="text-5xl mb-3">🤐</div>
              <p>No wishes yet. Invite friends to add one!</p>
            </div>
          )}

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all py-3 font-semibold inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your Wish
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="glass-dark rounded-3xl p-8 mb-8">
            <h2 className="font-display text-2xl font-semibold mb-6">
              Record Your Wish
            </h2>
            <ContributionForm onSubmit={handleAddContributor} />
          </div>
        )}

        {/* Dummy contributors for demo */}
        {contributors.length === 0 && (
          <div className="glass-dark rounded-3xl p-8 text-center">
            <p className="text-white/70">
              Invite friends via the link above to see their wishes appear here
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

interface ContributionFormProps {
  onSubmit: (name: string, videoWish: string) => void;
}

const ContributionForm: React.FC<ContributionFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleDemoSubmit = () => {
    if (name.trim()) {
      onSubmit(name, "video-data-url");
      setName("");
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/40 transition-colors"
      />

      <button
        onClick={() => setIsRecording(!isRecording)}
        className={`w-full rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 transition-all ${
          isRecording
            ? "bg-red-500/20 border border-red-500/50 text-red-400"
            : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-white/50"}`} />
        {isRecording ? "Recording... (demo)" : "Record Wish"}
      </button>

      <button
        onClick={handleDemoSubmit}
        disabled={!name.trim()}
        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all py-3 font-semibold inline-flex items-center justify-center gap-2"
      >
        <Send className="w-4 h-4" />
        Add Wish
      </button>
    </div>
  );
};

export default GroupContribution;
