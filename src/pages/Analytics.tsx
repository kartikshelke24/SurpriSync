import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Clock, TrendingUp, Smile } from "lucide-react";
import { getSurprise, getSession } from "@/lib/surprises";
import { toast } from "sonner";

interface EngagementDataPoint {
  step: string;
  views: number;
  avgTime: number;
}

const Analytics = () => {
  const { id } = useParams();
  const surprise = useMemo(() => (id ? getSurprise(id) : undefined), [id]);
  const session = useMemo(() => (id ? getSession(id) : undefined), [id]);

  // Generate dummy analytics data
  const analyticsData = useMemo(() => {
    if (!session?.engagement) {
      return {
        totalViews: 0,
        totalTimeSpent: 0,
        stepEngagement: [] as EngagementDataPoint[],
        reactions: {} as Record<string, number>,
      };
    }

    const engagement = session.engagement;
    return {
      totalViews: Math.max(engagement.linkClicks, 1),
      totalTimeSpent: Math.floor(Math.random() * 600) + 60, // 1-10 minutes in seconds
      stepEngagement: [
        { step: "Intro", views: Math.max(engagement.linkClicks, 1), avgTime: 8 },
        { step: "Unwrap", views: Math.max(Math.floor(engagement.linkClicks * 0.8), 1), avgTime: 12 },
        { step: "Memories", views: Math.max(Math.floor(engagement.linkClicks * 0.7), 1), avgTime: 45 },
        { step: "Message", views: Math.max(Math.floor(engagement.linkClicks * 0.6), 1), avgTime: 38 },
        { step: "Celebrate", views: Math.max(Math.floor(engagement.linkClicks * 0.5), 1), avgTime: 15 },
      ],
      reactions: {
        "❤️": Math.floor(Math.random() * 10) + 1,
        "😭": Math.floor(Math.random() * 8),
        "🥰": Math.floor(Math.random() * 12) + 2,
        "🔥": Math.floor(Math.random() * 6),
        "😂": Math.floor(Math.random() * 5),
      },
    };
  }, [session?.engagement]);

  if (!surprise) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-3xl p-10 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="font-display text-2xl font-semibold">Surprise not found</h1>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-2 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            Go back
          </button>
        </div>
      </main>
    );
  }

  const totalReactions = Object.values(analyticsData.reactions).reduce((a, b) => a + b, 0);
  const completionRate = Math.round(
    (analyticsData.stepEngagement[4]?.views / (analyticsData.totalViews || 1)) * 100
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-black">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl text-white">
        {/* Header */}
        <Link
          to={`/s/${id}/share`}
          className="inline-flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100 mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to surprise
        </Link>

        {/* Title */}
        <div className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold mb-2">
            Analytics
          </h1>
          <p className="text-lg text-white/80">
            See how {surprise.toName} is enjoying the surprise
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Views */}
          <div className="glass-dark rounded-3xl p-6 group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/80 font-semibold">Total Views</h3>
              <Eye className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-4xl font-display font-bold mb-2">
              {analyticsData.totalViews}
            </div>
            <p className="text-sm text-white/60">People who opened the link</p>
          </div>

          {/* Completion Rate */}
          <div className="glass-dark rounded-3xl p-6 group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/80 font-semibold">Completion</h3>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-4xl font-display font-bold mb-2">
              {completionRate}%
            </div>
            <p className="text-sm text-white/60">Made it to the end</p>
            <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Time Spent */}
          <div className="glass-dark rounded-3xl p-6 group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/80 font-semibold">Time Spent</h3>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-4xl font-display font-bold mb-2">
              {Math.floor(analyticsData.totalTimeSpent / 60)}m {analyticsData.totalTimeSpent % 60}s
            </div>
            <p className="text-sm text-white/60">Average viewing time</p>
          </div>

          {/* Reactions */}
          <div className="glass-dark rounded-3xl p-6 group hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/80 font-semibold">Reactions</h3>
              <Smile className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-4xl font-display font-bold mb-2">
              {totalReactions}
            </div>
            <p className="text-sm text-white/60">Emoji reactions</p>
          </div>
        </div>

        {/* Step Engagement */}
        <div className="glass-dark rounded-3xl p-8 mb-8">
          <h2 className="font-display text-2xl font-semibold mb-6">Step Engagement</h2>
          <div className="space-y-4">
            {analyticsData.stepEngagement.map((point, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{point.step}</span>
                  <span className="text-sm text-white/60">
                    {point.views} views · {point.avgTime}s avg
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(point.views / (analyticsData.totalViews || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reactions Breakdown */}
        <div className="glass-dark rounded-3xl p-8">
          <h2 className="font-display text-2xl font-semibold mb-6">Reaction Breakdown</h2>
          {totalReactions > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {Object.entries(analyticsData.reactions)
                .filter(([_, count]) => count > 0)
                .sort(([_, a], [__, b]) => b - a)
                .map(([emoji, count]) => (
                  <div
                    key={emoji}
                    className="glass rounded-2xl p-4 text-center hover:bg-white/10 transition-colors"
                  >
                    <div className="text-4xl mb-2">{emoji}</div>
                    <div className="font-display text-2xl font-bold">{count}</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <div className="text-4xl mb-2">🤐</div>
              <p>No reactions yet</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Analytics;
