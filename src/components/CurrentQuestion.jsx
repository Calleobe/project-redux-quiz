import { useState, useEffect } from "react";
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
  const totalQuestions = useSelector(
    (state) => state.quiz.questions.length
  );

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  //state for progress bar
  const [progressPercentage, setProgressPercentage] = useState(
    ((currentQuestionIndex + 1) / totalQuestions) * 100
  );
  //set a timerState (questions with countdown)
  const [timeLeft, setTimeLeft] = useState(10); // Set the initial countdown time


  if (!question) {
    return <h1>Oh no! I could not find the current question!</h1>;
  }

  const handleAnswer = (index) => {
    // Set a default value for unanswered questions (e.g., 0 for the first option)
    const answeredIndex = index !== null ? index : 0;
  
    const correct = question.correctAnswerIndex === answeredIndex;
    setSelectedAnswer(answeredIndex);
    setIsAnswerCorrect(correct);
    setShowFeedback(true);
  
    dispatch(
      quiz.actions.submitAnswer({
        questionId: question.id,
        answerIndex: answeredIndex,
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
  
      // Reset the timer for the next question
      setTimeLeft(10);
    }, 2000); // 2 seconds delay
  };
  

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000); // Update the timer every second
    } else {
      // Time is up, treat it as an incorrect answer
      handleAnswer(null);
    }
  
    return () => clearTimeout(timer); // Cleanup timer on component unmount or question change
  }, [timeLeft, handleAnswer]);

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
        <h2>{question.questionText}</h2>
        <div className="counter-time-wrapper">
        <p>
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </p>
        <p>Time left: {timeLeft}s</p>
        </div>
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
