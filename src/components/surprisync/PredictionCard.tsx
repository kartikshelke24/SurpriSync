import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { updateEngagement, unlockFeature } from "@/lib/surprises";
import { toast } from "sonner";

interface PredictionOption {
  id: string;
  label: string;
}

interface PredictionQuestion {
  id: string;
  question: string;
  description?: string;
  options: PredictionOption[];
}

const PREDICTION_QUESTIONS: PredictionQuestion[] = [
  {
    id: "tap_time",
    question: "How long until they tap the link?",
    options: [
      { id: "minutes", label: "Within minutes" },
      { id: "hours", label: "Within hours" },
      { id: "days", label: "In a few days" },
    ],
  },
  {
    id: "reaction",
    question: "What will they do first?",
    options: [
      { id: "cry", label: "Get emotional" },
      { id: "laugh", label: "Laugh out loud" },
      { id: "share", label: "Share with someone" },
    ],
  },
  {
    id: "replays",
    question: "How many times will they watch it?",
    options: [
      { id: "once", label: "Just once" },
      { id: "2to3", label: "2-3 times" },
      { id: "many", label: "Many times" },
    ],
  },
  {
    id: "guess",
    question: "Will they guess who sent it?",
    options: [
      { id: "immediately", label: "Immediately" },
      { id: "eventually", label: "Eventually" },
      { id: "never", label: "Never" },
    ],
  },
];

interface PredictionCardProps {
  surpriseId: string;
  onAnswer?: () => void;
}

export const PredictionCard = ({ surpriseId, onAnswer }: PredictionCardProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<PredictionQuestion>(PREDICTION_QUESTIONS[0]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (optionId: string) => {
    setIsSubmitting(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      updateEngagement(surpriseId, {
        questionsAnswered: {
          [selectedQuestion.id]: optionId,
        },
      });

      // Randomly unlock a feature sometimes
      if (Math.random() > 0.6) {
        unlockFeature(surpriseId, "prediction_master");
        toast.success("🏆 You've unlocked Prediction Master badge!");
      } else {
        toast.success("✨ Prediction saved! Let's see if you were right...");
      }

      setAnswered(true);
      setIsSubmitting(false);
      onAnswer?.();
    }, 600);
  };

  if (answered) {
    return (
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 sm:p-8 text-center animate-fade-up">
        <div className="text-4xl mb-3">✨</div>
        <h3 className="text-white font-display text-lg font-semibold mb-2">Prediction saved!</h3>
        <p className="text-white/80 text-sm mb-4">
          We'll check when they open the surprise. You might unlock a special badge if you're right.
        </p>
        <button
          onClick={() => {
            setAnswered(false);
            setSelectedQuestion(PREDICTION_QUESTIONS[Math.floor(Math.random() * PREDICTION_QUESTIONS.length)]);
            setSelectedOption(null);
          }}
          className="text-white/70 hover:text-white text-sm font-medium transition"
        >
          Make another prediction →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 sm:p-8 animate-fade-up">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-lg">🔮</div>
          <h3 className="text-white font-display font-semibold">Make a prediction</h3>
        </div>
        <p className="text-white/70 text-sm">Guess how they'll react when they open your surprise...</p>
      </div>

      <div className="space-y-3 mb-6">
        <label className="block text-white font-medium text-sm mb-4">{selectedQuestion.question}</label>
        {selectedQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            disabled={isSubmitting}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition ${
              selectedOption === option.id
                ? "bg-white text-foreground shadow-lg scale-[1.02]"
                : "bg-white/5 hover:bg-white/10 text-white"
            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="font-medium text-sm">{option.label}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ))}
      </div>

      <button
        onClick={() => selectedOption && handleAnswer(selectedOption)}
        disabled={!selectedOption || isSubmitting}
        className={`w-full py-3 rounded-xl font-semibold transition ${
          !selectedOption || isSubmitting
            ? "bg-white/20 text-white/50 cursor-not-allowed"
            : "bg-white text-foreground hover:bg-white/90 hover:scale-[1.02]"
        }`}
      >
        {isSubmitting ? "Saving..." : "Save prediction"}
      </button>

      {/* Question switcher */}
      <div className="mt-6 flex gap-1 flex-wrap justify-center">
        {PREDICTION_QUESTIONS.map((q) => (
          <button
            key={q.id}
            onClick={() => {
              setSelectedQuestion(q);
              setSelectedOption(null);
            }}
            disabled={isSubmitting}
            className={`h-2 rounded-full transition ${
              selectedQuestion.id === q.id ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Question ${q.id}`}
          />
        ))}
      </div>
    </div>
  );
};
