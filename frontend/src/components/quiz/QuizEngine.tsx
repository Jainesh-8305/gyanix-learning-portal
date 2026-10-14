'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, ChevronRight, Trophy } from 'lucide-react';
import { QuizQuestion } from '@/types';

interface Props {
  questions: QuizQuestion[];
  quizTitle: string;
  passingScore?: number;
  onComplete: (score: number, answers: Record<string, string>) => void;
}

export default function QuizEngine({ questions, quizTitle, passingScore = 70, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const current = questions[currentIndex];
  const selectedAnswer = answers[current?._id];
  const isCorrect = selectedAnswer === current?.correctAnswer;
  const isAnswered = !!selectedAnswer;

  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);
  const earnedPoints = questions.reduce((acc, q) =>
    acc + (answers[q._id] === q.correctAnswer ? q.points : 0), 0);
  const scorePercent = Math.round((earnedPoints / totalPoints) * 100);
  const passed = scorePercent >= passingScore;

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setAnswers(prev => ({ ...prev, [current._id]: option }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setShowResult(true);
      onComplete(scorePercent, answers);
    }
  };

  if (showResult) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <Trophy size={48} className="text-green-600" /> : <XCircle size={48} className="text-red-500" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {passed ? '🎉 Congratulations!' : 'Keep Practicing!'}
        </h2>
        <p className="text-gray-500 mb-6">
          You scored {scorePercent}% — {passed ? 'you passed!' : `need ${passingScore}% to pass`}
        </p>
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">{scorePercent}%</div>
          <div className="text-gray-500 text-sm">{earnedPoints} / {totalPoints} points</div>
          <div className="mt-4 h-3 bg-gray-200 rounded-full">
            <div className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${scorePercent}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {questions.filter(q => answers[q._id] === q.correctAnswer).length}
            </p>
            <p className="text-xs text-gray-500">Correct</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">
              {questions.filter(q => answers[q._id] && answers[q._id] !== q.correctAnswer).length}
            </p>
            <p className="text-xs text-gray-500">Wrong</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-400">
              {questions.filter(q => !answers[q._id]).length}
            </p>
            <p className="text-xs text-gray-500">Skipped</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-gray-900">{quizTitle}</h2>
        <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="h-1.5 bg-gray-200 rounded-full mb-8">
        <div className="h-full bg-indigo-600 rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3 mb-6">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            current.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            current.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'}`}>
            {current.difficulty}
          </span>
          <span className="text-xs text-gray-500">{current.points} point{current.points > 1 ? 's' : ''}</span>
        </div>

        <p className="text-lg font-medium text-gray-900 mb-6">{current.question}</p>

        <div className="space-y-3">
          {current.options?.map((option, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === current.correctAnswer;
            let optionClass = 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';
            if (isAnswered) {
              if (isCorrectOption) optionClass = 'border-green-500 bg-green-50';
              else if (isSelected) optionClass = 'border-red-400 bg-red-50';
            }
            if (!isAnswered && isSelected) optionClass = 'border-indigo-500 bg-indigo-50';

            return (
              <button key={option} onClick={() => handleSelect(option)} disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center gap-3 ${optionClass} disabled:cursor-default`}>
                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                  {letter}
                </span>
                <span className="text-gray-800">{option}</span>
                {isAnswered && isCorrectOption && <CheckCircle size={18} className="text-green-600 ml-auto" />}
                {isAnswered && isSelected && !isCorrectOption && <XCircle size={18} className="text-red-500 ml-auto" />}
              </button>
            );
          })}
        </div>

        {showExplanation && current.explanation && (
          <div className={`mt-5 p-4 rounded-xl text-sm ${isCorrect
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-orange-50 text-orange-800 border border-orange-200'}`}>
            <p className="font-semibold mb-1">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
            <p>{current.explanation}</p>
          </div>
        )}

        {isAnswered && (
          <button onClick={handleNext}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}