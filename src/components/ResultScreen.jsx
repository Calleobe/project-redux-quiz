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
  const globalElapsedTime = useSelector(
    (state) => state.quiz.globalElapsedTime
  );
  const [confetti, setConfetti] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 0.5, y: 0.5 });
  const incorrectAnswers = useSelector((state) => state.quiz.incorrectAnswers);

  useEffect(() => {
    if (correctAnswers > 5) {
      // Adjust the confetti origin if needed
      // For example, center of the screen
      setConfettiOrigin({ x: 0.5, y: 0.5 });

      // Confetti effect
      setConfetti(true);
      const timer = setTimeout(() => {
        setConfetti(false);
      }, 10000); // 10 seconds

      return () => {
        clearTimeout(timer);
      };
    }
  }, [correctAnswers]);

  const restartQuiz = () => {
    dispatch(quiz.actions.restart());
  };

  return (
    <div className="results">
      {confetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          origin={confettiOrigin}
        />
      )}
      <h1>Quiz Completed!</h1>
      {correctAnswers <= 5 ? (
        <div>
          <img src="geography-wrong.png" alt="Motivational Image" />
          <h1 style={{ color: "orange" }}>You Lose!</h1>
        </div>
      ) : (
        <h1 style={{ color: "green" }}>You Win!</h1>
      )}

      <p>{`You got ${correctAnswers} out of ${totalQuestions} questions right.`}</p>
      <p>{`You did not reply in time to ${unansweredCount} questions.`}</p>
      <p>Total Time Elapsed: {globalElapsedTime.toFixed(2)} seconds</p>
      <h2>You need to study more about these topics:</h2>
      <ul>
        {incorrectAnswers.map((item, index) => (
          <li key={index}>
            {item.correctAnswer} (from question: {item.questionText})
          </li>
        ))}
      </ul>
      <button onClick={restartQuiz}>Restart Quiz</button>
    </div>
  );
};

export default ResultScreen;
