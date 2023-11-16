import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { quiz } from "../reducers/quiz";
import Confetti from "react-confetti";

const ResultScreen = () => {
  const dispatch = useDispatch();
  const answers = useSelector((state) => state.quiz.answers);
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const unansweredCount = useSelector((state) => state.quiz.unansweredCount);
  const totalQuestions = useSelector((state) => state.quiz.questions.length);

  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    setConfetti(true);

    const timer = setTimeout(() => {
      setConfetti(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const restartQuiz = () => {
    dispatch(quiz.actions.restart());
  };

  return (
    <div>
      {confetti && <Confetti />}
      <h1>Quiz Completed!</h1>
      <p>{`You got ${correctAnswers} out of ${totalQuestions} questions right.`}</p>
      <p>{`You did not reply to ${unansweredCount} questions.`}</p>
      <button onClick={restartQuiz}>Restart Quiz</button>
    </div>
  );
};

export default ResultScreen;
