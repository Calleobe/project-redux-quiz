import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { quiz } from "../reducers/quiz";
import "../styles.css";

export const CurrentQuestion = () => {
  const dispatch = useDispatch();
  const currentQuestionIndex = useSelector(
    (state) => state.quiz.currentQuestionIndex
  );
  const question = useSelector(
    (state) => state.quiz.questions[currentQuestionIndex]
  );
  const totalQuestions = useSelector((state) => state.quiz.questions.length);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  //state for progress bar
  const [progressPercentage, setProgressPercentage] = useState(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );

  if (!question) {
    return <h1>Oh no! I could not find the current question!</h1>;
  }

  const handleAnswer = (index) => {
    const correct = question.correctAnswerIndex === index;
    setSelectedAnswer(index);
    setIsAnswerCorrect(correct);
    setShowFeedback(true);

    dispatch(
      quiz.actions.submitAnswer({
        questionId: question.id,
        answerIndex: index,
        isCorrect: correct,
      })
    );

    setTimeout(() => {
      dispatch(quiz.actions.goToNextQuestion());
      setShowFeedback(false);
      setSelectedAnswer(null);
      setIsAnswerCorrect(null);

      // Update progress percentage for the progressBar
      setProgressPercentage(
        ((currentQuestionIndex + 2) / totalQuestions) * 100
      );
    }, 2000); // 2 seconds delay
  };

  const getButtonStyle = (index) => {
    if (selectedAnswer === index) {
      return isAnswerCorrect ? "button-correct" : "button-incorrect";
    }
    if (isAnswerCorrect === false && index === question.correctAnswerIndex) {
      return "button-correct";
    }
    return "";
  };

  return (
    <div className="new-page">
      <div className="question-box">
        {question.image && (
          <img
            src={question.image}
            alt="Question Image"
            className="quiz-image"
          />
        )}
        <h2>{question.questionText}</h2>

        <p>
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </p>
        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        {showFeedback && (
          <p>{isAnswerCorrect ? "Correct answer" : "Wrong answer"}</p>
        )}
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className={getButtonStyle(index)}
            disabled={showFeedback} // Disable the button when feedback is being shown
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
